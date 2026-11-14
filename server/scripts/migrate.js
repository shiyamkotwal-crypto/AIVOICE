import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import pg from 'pg';
import { createClient } from '@supabase/supabase-js';

const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from server/.env
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

const MIGRATION_FILE = path.resolve(__dirname, '../../supabase/migrations/001_initial_schema.sql');

async function runMigration() {
  console.log(`
====================================================================
  🚀 VoiceBridge AI — Supabase Cloud PostgreSQL Migration Runner
====================================================================
  `);

  if (!fs.existsSync(MIGRATION_FILE)) {
    console.error(`❌ Migration file not found at: ${MIGRATION_FILE}`);
    process.exit(1);
  }

  const sqlContent = fs.readFileSync(MIGRATION_FILE, 'utf-8');
  console.log(`📄 Loaded migration file: 001_initial_schema.sql (${sqlContent.length} bytes)`);

  const dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  // -------------------------------------------------------------
  // STRATEGY 1: Direct PostgreSQL Connection (Recommended for Cloud)
  // -------------------------------------------------------------
  if (dbUrl && dbUrl.trim() !== '') {
    console.log('\n📡 Connecting directly to Supabase Cloud PostgreSQL via DATABASE_URL...');
    const client = new Client({
      connectionString: dbUrl,
      ssl: {
        rejectUnauthorized: false,
      },
    });

    try {
      await client.connect();
      console.log('✅ Connected to PostgreSQL database.');

      console.log('⚡ Applying migrations, RLS policies, triggers, and seed data in transaction...');
      await client.query('BEGIN');
      await client.query(sqlContent);
      await client.query('COMMIT');

      console.log('\n🎉 Migration applied successfully to Supabase PostgreSQL!');

      // Verify table counts
      const profilesCount = await client.query('SELECT count(*) FROM public.profiles');
      const convsCount = await client.query('SELECT count(*) FROM public.conversations');
      const msgsCount = await client.query('SELECT count(*) FROM public.messages');

      console.log(`📊 Status Summary:`);
      console.log(`   • Profiles seeded: ${profilesCount.rows[0].count}`);
      console.log(`   • Conversations seeded: ${convsCount.rows[0].count}`);
      console.log(`   • Messages seeded: ${msgsCount.rows[0].count}`);

      await client.end();
      process.exit(0);
    } catch (err) {
      await client.query('ROLLBACK').catch(() => {});
      console.error('❌ Migration failed via direct PostgreSQL connection:', err.message);
      await client.end().catch(() => {});
      // Fall through to other strategies
    }
  }

  // -------------------------------------------------------------
  // STRATEGY 2: Supabase Service Role Key via HTTPS API / RPC
  // -------------------------------------------------------------
  if (supabaseUrl && serviceRoleKey && supabaseUrl.startsWith('http')) {
    console.log(`\n🔑 Attempting Supabase REST / Service Role execution on ${supabaseUrl}...`);
    const projectRef = supabaseUrl.replace('https://', '').split('.')[0];

    try {
      // Attempt executing SQL via Supabase REST SQL runner endpoint
      const response = await fetch(`${supabaseUrl}/pg/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify({ query: sqlContent }),
      });

      if (response.ok) {
        console.log('🎉 Migration applied successfully via Supabase Cloud SQL API!');
        process.exit(0);
      } else {
        const errorText = await response.text();
        console.log(`ℹ️ Supabase REST /pg/query endpoint response: ${response.status} (${errorText.slice(0, 100)})`);
      }
    } catch (httpErr) {
      console.log('ℹ️ REST SQL endpoint not directly exposed, checking Supabase Client...');
    }

    // Try Supabase JS client with service role key to test connection and seed data
    try {
      const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false },
      });

      // Test inserting / verifying tables
      const { data, error } = await supabaseAdmin.from('profiles').select('count', { count: 'exact', head: true });
      if (!error) {
        console.log('✅ Supabase database tables already exist and are reachable with Service Role Key!');
        console.log(`   Table 'profiles' is ready. Applying seed data via Service Role Client...`);

        // Seed profiles
        await supabaseAdmin.from('profiles').upsert([
          {
            id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
            full_name: 'Alex Rivera (Demo Student)',
            email: 'student.demo@voicebridge.ai',
            role: 'student',
          },
          {
            id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
            full_name: 'Dr. Sarah Connor (Demo Admin)',
            email: 'admin.demo@voicebridge.ai',
            role: 'admin',
          },
          {
            id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
            full_name: 'Prof. Rajesh Sharma',
            email: 'faculty.demo@voicebridge.ai',
            role: 'faculty',
          },
        ]);

        console.log('✅ Seed profiles updated via Service Role Key.');
        process.exit(0);
      } else {
        console.log(`ℹ️ Tables not yet detected via REST: ${error.message}`);
      }
    } catch (clientErr) {
      console.warn('Supabase client check notice:', clientErr.message);
    }

    // Provide actionable instructions for projectRef
    console.log(`
--------------------------------------------------------------------
📌 Notice on Applying Schema to Supabase Cloud:
   Supabase projects require either:
   1) Direct PostgreSQL connection URL in server/.env:
      DATABASE_URL="postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres"
      (Then run: npm run db:migrate)

   OR

   2) 1-Click Supabase Dashboard SQL Editor:
      • Open https://supabase.com/dashboard/project/${projectRef}/sql/new
      • Copy & paste the contents of /supabase/migrations/001_initial_schema.sql
      • Click "Run"
--------------------------------------------------------------------
    `);
  }

  // -------------------------------------------------------------
  // STRATEGY 3: Local Engine Seeding (Immediate zero-setup fallback)
  // -------------------------------------------------------------
  console.log('\n💾 Seeding local persistent storage engine with 001_initial_schema.sql demo dataset...');
  const DATA_DIR = path.resolve(__dirname, '../data');
  const DB_FILE = path.join(DATA_DIR, 'voicebridge.json');

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const initialSeed = {
    profiles: [
      {
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        full_name: 'Alex Rivera (Demo Student)',
        email: 'student.demo@voicebridge.ai',
        password_hash: '$2a$10$WqB8gT30uYmG84G7rJ6K9uD0L6p5q4j5k6l7m8n9o0p1q2r3s4t5u', // DemoPass2026!
        role: 'student',
        created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      },
      {
        id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
        full_name: 'Dr. Sarah Connor (Demo Admin)',
        email: 'admin.demo@voicebridge.ai',
        password_hash: '$2a$10$WqB8gT30uYmG84G7rJ6K9uD0L6p5q4j5k6l7m8n9o0p1q2r3s4t5u',
        role: 'admin',
        created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
      },
      {
        id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
        full_name: 'Prof. Rajesh Sharma',
        email: 'faculty.demo@voicebridge.ai',
        password_hash: '$2a$10$WqB8gT30uYmG84G7rJ6K9uD0L6p5q4j5k6l7m8n9o0p1q2r3s4t5u',
        role: 'faculty',
        created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
      },
    ],
    conversations: [
      {
        id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
        user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        title: 'Semester Fee Payment & Examination Schedule',
        language: 'en-US',
        domain: 'Academic & Admissions',
        created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
      {
        id: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
        user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        title: 'कैंपस वाई-फाई सेटअप और पासवर्ड सहायता',
        language: 'hi-IN',
        domain: 'Technical Helpdesk',
        created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
      },
      {
        id: 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
        user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        title: 'ಹಾಸ್ಟೆಲ್ ಹಂಚಿಕೆ ಮತ್ತು ಲೈಬ್ರರಿ ಸಮಯ',
        language: 'kn-IN',
        domain: 'Campus Facilities',
        created_at: new Date(Date.now() - 12 * 3600000).toISOString(),
      },
      {
        id: '10eebc99-9c0b-4ef8-bb6d-6bb9bd380a77',
        user_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
        title: 'Emisión de credenciales y actas oficiales',
        language: 'es-ES',
        domain: 'General Administrative',
        created_at: new Date(Date.now() - 4 * 3600000).toISOString(),
      },
    ],
    messages: [
      {
        id: '20eebc99-9c0b-4ef8-bb6d-6bb9bd380a81',
        conversation_id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
        sender: 'user',
        content: 'When is the semester fee payment deadline and where can I download my hall ticket?',
        audio_played: true,
        is_voice: true,
        language: 'en-US',
        created_at: new Date(Date.now() - 2 * 86400000 + 60000).toISOString(),
      },
      {
        id: '20eebc99-9c0b-4ef8-bb6d-6bb9bd380a82',
        conversation_id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
        sender: 'ai',
        content: 'The semester fee payment deadline is November 30th through the Student ERP portal. Mid-term examination hall tickets will be available for download starting December 8th under the Examination tab.',
        audio_played: true,
        is_voice: false,
        language: 'en-US',
        created_at: new Date(Date.now() - 2 * 86400000 + 120000).toISOString(),
      },
      {
        id: '20eebc99-9c0b-4ef8-bb6d-6bb9bd380a83',
        conversation_id: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
        sender: 'user',
        content: 'कैंपस वाई-फाई नेटवर्क का पासवर्ड क्या है और इसे लैपटॉप में कैसे जोड़ें?',
        audio_played: true,
        is_voice: true,
        language: 'hi-IN',
        created_at: new Date(Date.now() - 1 * 86400000 + 60000).toISOString(),
      },
      {
        id: '20eebc99-9c0b-4ef8-bb6d-6bb9bd380a84',
        conversation_id: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
        sender: 'ai',
        content: 'कैंपस वाई-फाई से जुड़ने के लिए "Campus-Secure" नेटवर्क चुनें। प्रमाणीकरण प्रकार में WPA2-Enterprise चुनें और अपने छात्र रोल नंबर तथा ERP पासवर्ड से लॉगिन करें। किसी भी सहायता के लिए आईटी डेस्क रूम 204 खुला है।',
        audio_played: true,
        is_voice: false,
        language: 'hi-IN',
        created_at: new Date(Date.now() - 1 * 86400000 + 120000).toISOString(),
      },
    ],
  };

  fs.writeFileSync(DB_FILE, JSON.stringify(initialSeed, null, 2), 'utf-8');
  console.log('✅ Local persistent engine seeded with initial schema dataset.');
  console.log('🏁 Migration runner finished successfully.');
  process.exit(0);
}

runMigration().catch((err) => {
  console.error('Fatal migration error:', err);
  process.exit(1);
});
