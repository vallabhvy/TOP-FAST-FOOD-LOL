const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function fixLikes() {
  console.log("Fixing null likes/dislikes...");
  const { data, error } = await supabase.rpc('fix_null_likes', {});
  if (error) {
    console.log("RPC fix_null_likes doesn't exist, falling back to simple updates.");
    // Since we can't easily do a mass IS NULL update via standard JS client without iterating, 
    // we'll fetch all transactions where likes is null and update them.
    const { data: txs } = await supabase.from('transactions').select('id, likes, dislikes');
    if (txs) {
        for (const tx of txs) {
            if (tx.likes === null || tx.dislikes === null) {
                await supabase.from('transactions').update({
                    likes: tx.likes || 0,
                    dislikes: tx.dislikes || 0
                }).eq('id', tx.id);
            }
        }
    }
  }
  console.log("Done fixing likes.");
}

fixLikes();
