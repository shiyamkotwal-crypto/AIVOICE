import { v4 as uuidv4 } from 'uuid';
import {
  createConversation,
  getConversationsByUserId,
  getConversationById,
  deleteConversation,
  createMessage,
  getMessagesByConversationId,
  updateMessageAudioPlayed,
  updateConversation,
} from '../services/dbService.js';
import { generateConversationalResponse, extractIntentAndActions, detectLanguageFromScript } from '../services/geminiService.js';

/**
 * Main Real-time Multimodal Voice & Text Chat Endpoint
 * POST /api/chat
 */
export async function handleChatMessage(req, res) {
  try {
    const userId = req.user.id;
    const {
      conversation_id,
      message,
      language = 'en',
      domain = 'General Administrative',
      persona = 'buddy',
      is_voice = false,
    } = req.validatedData;

    let activeConversationId = conversation_id;
    let conversation;

    const scriptLang = detectLanguageFromScript(message);
    const effectiveLang = scriptLang || language;

    // If conversation_id is provided, verify ownership
    if (activeConversationId) {
      conversation = await getConversationById(activeConversationId, userId);
      if (!conversation) {
        return res.status(404).json({
          success: false,
          error: 'Conversation not found or access denied.',
        });
      }
      // Update language/domain if changed or script detected
      if (conversation.language !== effectiveLang || conversation.domain !== domain) {
        await updateConversation(activeConversationId, { language: effectiveLang, domain });
        conversation.language = effectiveLang;
      }
    } else {
      // Auto-generate conversation title from first user query (max 45 chars)
      const cleanTitle = message.replace(/[^\w\s\u0900-\u097F\u0C80-\u0CFF]/g, '').trim();
      const title = cleanTitle.length > 40 ? cleanTitle.slice(0, 40) + '...' : cleanTitle || 'Voice Conversation';

      conversation = await createConversation({
        id: uuidv4(),
        user_id: userId,
        title,
        language: effectiveLang,
        domain,
      });
      activeConversationId = conversation.id;
    }

    // Retrieve previous messages for multi-turn conversational context
    const previousMessages = await getMessagesByConversationId(activeConversationId);

    // Save user message to database
    const userMessage = await createMessage({
      id: uuidv4(),
      conversation_id: activeConversationId,
      sender: 'user',
      content: message,
      audio_played: true,
      is_voice: Boolean(is_voice),
      language,
    });

    // Generate intelligent AI response via Gemini 3.8 Flash
    const aiResponseData = await generateConversationalResponse({
      message,
      language,
      domain,
      persona,
      history: previousMessages,
    });

    // Save AI response to database
    const aiMessage = await createMessage({
      id: uuidv4(),
      conversation_id: activeConversationId,
      sender: 'ai',
      content: aiResponseData.content,
      audio_played: false, // Default false, frontend will update to true upon TTS playback
      is_voice: false,
      language,
    });

    return res.status(200).json({
      success: true,
      conversation_id: activeConversationId,
      user_message: userMessage,
      ai_message: {
        ...aiMessage,
        metadata: aiResponseData.metadata,
      },
      model: aiResponseData.model,
      domain,
      language,
      persona,
    });
  } catch (err) {
    console.error('handleChatMessage error:', err);
    // Graceful fallback so user always receives an actionable spoken response
    try {
      const fallbackResponse = await generateConversationalResponse({
        message: req.body?.message || 'Hello',
        language: req.body?.language || 'en',
        domain: req.body?.domain || 'General Administrative',
      });
      return res.status(200).json({
        success: true,
        conversation_id: req.body?.conversation_id || 'fallback-conv',
        user_message: {
          id: 'msg-' + Date.now(),
          sender: 'user',
          content: req.body?.message || '',
          language: req.body?.language || 'en',
          created_at: new Date().toISOString(),
        },
        ai_message: {
          id: 'msg-' + (Date.now() + 1),
          sender: 'ai',
          content: fallbackResponse.content,
          metadata: fallbackResponse.metadata,
          audio_played: false,
          language: req.body?.language || 'en',
          created_at: new Date().toISOString(),
        },
        model: 'voicebridge-resilient-relay',
        domain: req.body?.domain || 'General Administrative',
        language: req.body?.language || 'en',
      });
    } catch (fallbackErr) {
      return res.status(500).json({
        success: false,
        error: err.message || 'Failed to process chat message.',
      });
    }
  }
}

/**
 * List all conversations for the authenticated user, optionally filtered by language
 * GET /api/conversations?language=en
 * GET /api/chat/history/:userId?language=en
 */
export async function listConversations(req, res) {
  try {
    const userId = req.params.userId || req.user.id;
    // Security check: if userId in params, ensure it matches req.user.id unless admin
    if (req.params.userId && req.params.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized access to user conversation history.',
      });
    }

    const { language } = req.query;
    const rawConversations = await getConversationsByUserId(userId, language);
    const conversations = rawConversations.map((c) => {
      const scriptLang = detectLanguageFromScript(c.title);
      if (scriptLang && scriptLang !== c.language) {
        c.language = scriptLang;
        updateConversation(c.id, { language: scriptLang }).catch(() => {});
      }
      return c;
    });
    return res.status(200).json({
      success: true,
      conversations,
      language: language || 'all',
      count: conversations.length,
    });
  } catch (err) {
    console.error('listConversations error:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve conversations.',
    });
  }
}

/**
 * Get details and message history for a single conversation
 * GET /api/conversations/:id
 */
export async function getConversation(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const conversation = await getConversationById(id, userId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found.',
      });
    }

    const scriptLang = detectLanguageFromScript(conversation.title);
    if (scriptLang && scriptLang !== conversation.language) {
      conversation.language = scriptLang;
      updateConversation(conversation.id, { language: scriptLang }).catch(() => {});
    }

    const rawMessages = await getMessagesByConversationId(id);
    const messages = rawMessages.map((m, idx) => {
      if (m.sender === 'ai') {
        const prevUser = idx > 0 && rawMessages[idx - 1]?.sender === 'user' ? rawMessages[idx - 1] : null;
        return {
          ...m,
          metadata: extractIntentAndActions(prevUser ? prevUser.content : m.content, m.content, conversation.domain, m.language),
        };
      }
      return m;
    });

    return res.status(200).json({
      success: true,
      conversation,
      messages,
    });
  } catch (err) {
    console.error('getConversation error:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve conversation details.',
    });
  }
}

/**
 * Create a new empty conversation manually
 * POST /api/conversations
 */
export async function createNewConversation(req, res) {
  try {
    const userId = req.user.id;
    const { title, language = 'en', domain = 'General Administrative' } = req.validatedData;

    const conversation = await createConversation({
      id: uuidv4(),
      user_id: userId,
      title,
      language,
      domain,
    });

    return res.status(201).json({
      success: true,
      conversation,
    });
  } catch (err) {
    console.error('createNewConversation error:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to create conversation.',
    });
  }
}

/**
 * Delete a conversation and its messages
 * DELETE /api/conversations/:id
 */
export async function deleteConversationHandler(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const deleted = await deleteConversation(id, userId);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found or could not be deleted.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Conversation deleted successfully.',
    });
  } catch (err) {
    console.error('deleteConversationHandler error:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete conversation.',
    });
  }
}

/**
 * Mark a message as audio played when TTS playback finishes
 * PATCH /api/messages/:id/audio-played
 */
export async function markMessageAudioPlayed(req, res) {
  try {
    const { id } = req.params;
    const updated = await updateMessageAudioPlayed(id);
    return res.status(200).json({
      success: true,
      message: updated,
    });
  } catch (err) {
    console.error('markMessageAudioPlayed error:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to update audio status.',
    });
  }
}
