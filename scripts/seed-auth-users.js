const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

function loadEnvFile(envPath) {
  if (!fs.existsSync(envPath)) {
    throw new Error(`Environment file not found: ${envPath}`);
  }

  const content = fs.readFileSync(envPath, 'utf-8');
  const lines = content.split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }

    const [key, ...rest] = line.split('=');
    if (!key || rest.length === 0) {
      continue;
    }

    const value = rest.join('=').trim();
    process.env[key.trim()] = process.env[key.trim()] ?? value;
  }
}

function getEnvVar(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function createSupabaseClient() {
  const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL');
  const supabaseAnonKey = getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY');

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

async function signInOrSignUp(supabase, email, password) {
  const signIn = await supabase.auth.signInWithPassword({ email, password });
  if (!signIn.error && signIn.data?.session?.user) {
    return signIn.data.session;
  }

  if (signIn.error && signIn.error.message.includes('Invalid login credentials')) {
    const signUp = await supabase.auth.signUp({ email, password });
    if (signUp.error && !signUp.data?.user) {
      if (signUp.error.message.includes('already registered')) {
        const retrySignIn = await supabase.auth.signInWithPassword({ email, password });
        if (!retrySignIn.error && retrySignIn.data?.session?.user) {
          return retrySignIn.data.session;
        }
      }

      throw new Error(`Unable to register user ${email}: ${signUp.error.message}`);
    }

    if (signUp.data?.session?.user) {
      return signUp.data.session;
    }

    const confirmSignIn = await supabase.auth.signInWithPassword({ email, password });
    if (!confirmSignIn.error && confirmSignIn.data?.session?.user) {
      return confirmSignIn.data.session;
    }

    throw new Error(`User registered, but sign-in failed for ${email}. Email confirmation may be required.`);
  }

  if (signIn.error) {
    throw new Error(`Unable to sign in user ${email}: ${signIn.error.message}`);
  }

  throw new Error(`Unexpected auth flow for ${email}`);
}

async function upsertProfile(supabase, userId, role, fullName) {
  const payload = {
    id: userId,
    full_name: fullName,
    role,
    phone: null,
    is_active: true,
  };

  const { error } = await supabase.from('profiles').upsert(payload);
  if (error) {
    throw new Error(`Failed to upsert profile for ${userId}: ${error.message}`);
  }
}

async function main() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    loadEnvFile(envPath);
  }

  const supabase = createSupabaseClient();

  const users = [
    { email: 'owner@example.com', password: 'Owner123!', role: 'owner' },
    { email: 'dokter@example.com', password: 'Dokter123!', role: 'dokter' },
    { email: 'staff@example.com', password: 'Staff123!', role: 'staff' },
    { email: 'customer@example.com', password: 'Customer123!', role: 'customer' },
  ];

  for (const user of users) {
    const name = user.email.split('@')[0];
    process.stdout.write(`Processing ${user.email}... `);

    const session = await signInOrSignUp(supabase, user.email, user.password);
    if (!session.user?.id) {
      throw new Error(`No user id available for ${user.email}`);
    }

    await upsertProfile(supabase, session.user.id, user.role, name);
    console.log('done');
  }

  console.log('Seed complete. You can run tests using the seeded credentials.');
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});