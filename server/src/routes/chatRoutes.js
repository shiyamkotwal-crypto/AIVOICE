import { Router } from 'express';
import {
  handleChatMessage,
  listConversations,
  getConversation,
  createNewConversation,
  deleteConversationHandler,
  markMessageAudioPlayed,
} from '../controllers/chatController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import {
  validateBody,
  chatMessageSchema,
  createConversationSchema,
} from '../middleware/validationMiddleware.js';

const router = Router();

// Real-time Chat
router.post('/chat', authenticateToken, validateBody(chatMessageSchema), handleChatMessage);

// Conversation management
router.get('/conversations', authenticateToken, listConversations);
router.get('/chat/history/:userId', authenticateToken, listConversations);
router.post('/conversations', authenticateToken, validateBody(createConversationSchema), createNewConversation);
router.get('/conversations/:id', authenticateToken, getConversation);
router.delete('/conversations/:id', authenticateToken, deleteConversationHandler);

// Audio status
router.patch('/messages/:id/audio-played', authenticateToken, markMessageAudioPlayed);

export default router;
