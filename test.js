const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://blkldqhgdakunrxxbbux.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsa2xkcWhnZGFrdW5yeHhiYnV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0NTQ4NTksImV4cCI6MjA5MjAzMDg1OX0.OdbrPwjrTmwDgbvO3MFd1w6vWFOgNjqvx05gjje0GKI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from("posts").insert({
      content: "test format",
      is_anonymous: true,
      user_id: null,
      community_id: null
    });
  console.log("Error:", error);
  console.log("Data:", data);
}
test();
