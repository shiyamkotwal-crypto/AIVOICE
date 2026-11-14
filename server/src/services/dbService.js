import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { supabase, isSupabaseConfigured } from '../config/supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'voicebridge.json');

// Ensure data directory and database file exist for local fallback
function initLocalStore() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const initialData = {
      profiles: [],
      conversations: [],
      messages: [],
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
  }
}

initLocalStore();

function readLocalDB() {
  try {
    initLocalStore();
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading local DB, re-initializing:', err);
    const fallback = { profiles: [], conversations: [], messages: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(fallback, null, 2), 'utf-8');
    return fallback;
  }
}

function writeLocalDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing to local DB:', err);
  }
}

// ---------------- PROFILES ---------------- //

export async function createProfile({ id = uuidv4(), full_name, email, password_hash, role = 'student' }) {
  const now = new Date().toISOString();

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([{ id, full_name, email, role, created_at: now }])
        .select()
        .single();
      if (!error && data) {
        // Also cache locally for password verification if using custom auth
        const local = readLocalDB();
        local.profiles.push({ id, full_name, email, password_hash, role, created_at: now });
        writeLocalDB(local);
        return { id: data.id, full_name: data.full_name, email: data.email, role: data.role, created_at: data.created_at };
      }
    } catch (e) {
      console.warn('Supabase profile insertion error, falling back to local store:', e.message);
    }
  }

  // Local Store Fallback
  const db = readLocalDB();
  const existing = db.profiles.find((p) => p.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    throw new Error('User with this email already exists');
  }

  const newProfile = {
    id,
    full_name,
    email,
    password_hash,
    role,
    created_at: now,
  };
  db.profiles.push(newProfile);
  writeLocalDB(db);

  const { password_hash: _, ...safeProfile } = newProfile;
  return safeProfile;
}

export async function getProfileByEmail(email) {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .maybeSingle();
      if (!error && data) {
        // Fetch password hash from local cache for verification
        const local = readLocalDB();
        const localProfile = local.profiles.find((p) => p.email.toLowerCase() === email.toLowerCase());
        return { ...data, password_hash: localProfile?.password_hash };
      }
    } catch (e) {
      console.warn('Supabase fetch profile error:', e.message);
    }
  }

  const db = readLocalDB();
  return db.profiles.find((p) => p.email.toLowerCase() === email.toLowerCase()) || null;
}

export async function getProfileById(id) {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, created_at')
        .eq('id', id)
        .maybeSingle();
      if (!error && data) return data;
    } catch (e) {
      console.warn('Supabase getProfileById error:', e.message);
    }
  }

  const db = readLocalDB();
  const p = db.profiles.find((p) => p.id === id);
  if (!p) return null;
  const { password_hash: _, ...safeProfile } = p;
  return safeProfile;
}

// ---------------- CONVERSATIONS ---------------- //

export async function createConversation({
  id = uuidv4(),
  user_id,
  title,
  language = 'en',
  domain = 'General Administrative',
}) {
  const now = new Date().toISOString();

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert([{ id, user_id, title, language, domain, created_at: now }])
        .select()
        .single();
      if (!error && data) return data;
    } catch (e) {
      console.warn('Supabase createConversation error:', e.message);
    }
  }

  const db = readLocalDB();
  const newConv = {
    id,
    user_id,
    title,
    language,
    domain,
    created_at: now,
  };
  db.conversations.push(newConv);
  writeLocalDB(db);
  return newConv;
}

export async function getConversationsByUserId(user_id, language = null) {
  if (isSupabaseConfigured) {
    try {
      let query = supabase
        .from('conversations')
        .select('*, messages(count)')
        .eq('user_id', user_id);

      if (language && language !== 'all') {
        const baseLang = language.split('-')[0].toLowerCase();
        // Support exact match or prefix match (e.g. 'en', 'en-US', 'en-IN')
        query = query.ilike('language', `${baseLang}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (!error && data) {
        return data.map((c) => ({
          ...c,
          message_count:
            Array.isArray(c.messages) && c.messages[0] && typeof c.messages[0].count === 'number'
              ? c.messages[0].count
              : c.message_count || 0,
        }));
      }
    } catch (e) {
      console.warn('Supabase getConversations error:', e.message);
    }
  }

  const db = readLocalDB();
  let convs = db.conversations
    .filter((c) => c.user_id === user_id);

  if (language && language !== 'all') {
    const baseLang = language.split('-')[0].toLowerCase();
    convs = convs.filter((c) => {
      const convLang = (c.language || '').toLowerCase();
      return convLang === language.toLowerCase() || convLang.startsWith(baseLang);
    });
  }

  convs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  // Add message count and last message preview
  return convs.map((c) => {
    const msgs = db.messages
      .filter((m) => m.conversation_id === c.id)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return {
      ...c,
      message_count: msgs.length,
      last_message: msgs[0] ? msgs[0].content.slice(0, 100) : '',
      last_message_at: msgs[0] ? msgs[0].created_at : c.created_at,
    };
  });
}

export async function getConversationById(id, user_id) {
  if (isSupabaseConfigured) {
    try {
      let query = supabase.from('conversations').select('*').eq('id', id);
      if (user_id) query = query.eq('user_id', user_id);
      const { data, error } = await query.maybeSingle();
      if (!error && data) return data;
    } catch (e) {
      console.warn('Supabase getConversationById error:', e.message);
    }
  }

  const db = readLocalDB();
  return db.conversations.find((c) => c.id === id && (!user_id || c.user_id === user_id)) || null;
}

export async function updateConversation(id, updates) {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (!error && data) return data;
    } catch (e) {
      console.warn('Supabase updateConversation error:', e.message);
    }
  }

  const db = readLocalDB();
  const idx = db.conversations.findIndex((c) => c.id === id);
  if (idx !== -1) {
    db.conversations[idx] = { ...db.conversations[idx], ...updates };
    writeLocalDB(db);
    return db.conversations[idx];
  }
  return null;
}

export async function deleteConversation(id, user_id) {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', id)
        .eq('user_id', user_id);
      if (!error) return true;
    } catch (e) {
      console.warn('Supabase deleteConversation error:', e.message);
    }
  }

  const db = readLocalDB();
  const convIndex = db.conversations.findIndex((c) => c.id === id && c.user_id === user_id);
  if (convIndex === -1) return false;

  db.conversations.splice(convIndex, 1);
  // Cascade delete messages
  db.messages = db.messages.filter((m) => m.conversation_id !== id);
  writeLocalDB(db);
  return true;
}

// ---------------- MESSAGES ---------------- //

export async function createMessage({
  id = uuidv4(),
  conversation_id,
  sender,
  content,
  audio_played = false,
  is_voice = false,
  language = 'en',
}) {
  const now = new Date().toISOString();

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([
          {
            id,
            conversation_id,
            sender,
            content,
            audio_played,
            created_at: now,
          },
        ])
        .select()
        .single();
      if (!error && data) {
        return {
          ...data,
          is_voice,
          language,
        };
      }
    } catch (e) {
      console.warn('Supabase createMessage error:', e.message);
    }
  }

  const db = readLocalDB();
  const newMsg = {
    id,
    conversation_id,
    sender,
    content,
    audio_played,
    is_voice,
    language,
    created_at: now,
  };
  db.messages.push(newMsg);
  writeLocalDB(db);
  return newMsg;
}

export async function getMessagesByConversationId(conversation_id) {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversation_id)
        .order('created_at', { ascending: true });
      if (!error && data) return data;
    } catch (e) {
      console.warn('Supabase getMessages error:', e.message);
    }
  }

  const db = readLocalDB();
  return db.messages
    .filter((m) => m.conversation_id === conversation_id)
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
}

export async function updateMessageAudioPlayed(id) {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .update({ audio_played: true })
        .eq('id', id)
        .select()
        .single();
      if (!error && data) return data;
    } catch (e) {
      console.warn('Supabase updateMessageAudioPlayed error:', e.message);
    }
  }

  const db = readLocalDB();
  const msg = db.messages.find((m) => m.id === id);
  if (msg) {
    msg.audio_played = true;
    writeLocalDB(db);
    return msg;
  }
  return null;
}

// ---------------- ANALYTICS ---------------- //

export async function getUserAnalytics(user_id) {
  const db = readLocalDB();

  let userConvs = db.conversations.filter((c) => c.user_id === user_id);
  const convIds = new Set(userConvs.map((c) => c.id));
  let userMessages = db.messages.filter((m) => convIds.has(m.conversation_id));

  // If Supabase is active, query counts
  if (isSupabaseConfigured) {
    try {
      const { data: cData } = await supabase
        .from('conversations')
        .select('id, language, domain, created_at')
        .eq('user_id', user_id);
      if (cData) {
        userConvs = cData;
        const cIds = userConvs.map((c) => c.id);
        if (cIds.length > 0) {
          const { data: mData } = await supabase
            .from('messages')
            .select('*')
            .in('conversation_id', cIds);
          if (mData) userMessages = mData;
        }
      }
    } catch (e) {
      console.warn('Supabase analytics fetch error:', e.message);
    }
  }

  const totalConversations = userConvs.length;
  const totalMessages = userMessages.length;
  const userQueries = userMessages.filter((m) => m.sender === 'user');
  const voiceQueries = userQueries.filter((m) => m.is_voice === true).length;
  const textQueries = userQueries.length - voiceQueries;

  const audioPlayedCount = userMessages.filter((m) => m.sender === 'ai' && m.audio_played).length;
  const totalAiResponses = userMessages.filter((m) => m.sender === 'ai').length;

  // Language breakdown
  const languageStats = {};
  userConvs.forEach((c) => {
    const lang = c.language || 'en';
    languageStats[lang] = (languageStats[lang] || 0) + 1;
  });

  // Domain breakdown
  const domainStats = {
    'Academic & Admissions': 0,
    'Technical Helpdesk': 0,
    'Campus Facilities': 0,
    'General Administrative': 0,
  };
  userConvs.forEach((c) => {
    const dom = c.domain || 'General Administrative';
    domainStats[dom] = (domainStats[dom] || 0) + 1;
  });

  return {
    totalConversations,
    totalMessages,
    userQueriesCount: userQueries.length,
    voiceQueries,
    textQueries,
    voiceRatioPercentage: userQueries.length > 0 ? Math.round((voiceQueries / userQueries.length) * 100) : 0,
    audioPlaybackRate: totalAiResponses > 0 ? Math.round((audioPlayedCount / totalAiResponses) * 100) : 0,
    languageStats,
    domainStats,
    recentActivity: userConvs.slice(0, 5),
  };
}
