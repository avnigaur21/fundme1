const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_KEY in environment variables.");
  process.exit(1);
}

// Node 20 does not expose a native WebSocket constructor. Supabase Realtime
// otherwise throws during client construction and repeatedly crashes Railway.
const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: { transport: WebSocket }
});

module.exports = supabase;
