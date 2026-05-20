const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=["']?(.*?)["']?(\n|$)/)[1];
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=["']?(.*?)["']?(\n|$)/)[1];

const supabase = createClient(url, key);

async function run() {
  console.log('Wiping products...');
  const { error } = await supabase.from('products').delete().neq('id', '0');
  console.log('Done:', error);
}

run();
