const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testVote() {
  console.log("Testing vote...");
  
  // Get a real transaction ID first
  const { data: txs, error: txError } = await supabase.from('transactions').select('id').limit(1);
  if (txError || !txs.length) {
      console.error("Failed to get transaction:", txError);
      return;
  }
  
  const txId = txs[0].id;
  console.log("Using transaction ID:", txId);

  const { data, error } = await supabase.rpc("vote_transaction", {
      p_transaction_id: txId,
      p_ip_address: "test_device_" + Math.random(),
      p_vote_type: "LIKE"
  });

  if (error) {
      console.error("RPC Error:", error);
  } else {
      console.log("RPC Success:", data);
  }
}

testVote();
