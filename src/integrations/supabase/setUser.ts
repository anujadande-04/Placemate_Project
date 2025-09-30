import { createClient } from "@supabase/supabase-js";

// Replace with your actual Supabase URL and Service Role Key
const SUPABASE_URL = "https://yduiaxjgolkiaydilfux.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkdWlheGpnb2xraWF5ZGlsZnV4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODAzMzgyMiwiZXhwIjoyMDczNjA5ODIyfQ.y9Ak_va-E_J5sPLCnl3f1u7WLRWUHKc8ovmA371x-yk";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function setUserRoles() {
  const updates = [
    {
      id: "574b242d-42f8-4106-b33d-d5b1b876389b", // admin@gmail.com
      role: "admin",
    },
    {
      id: "4d00df66-d103-4fa1-ab2d-6663732fd2bf", // student@gmail.com
      role: "student",
    },
  ];

  for (const user of updates) {
    const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: { role: user.role },
    });

    if (error) {
      console.error(`❌ Failed to update ${user.id}:`, error.message);
    } else {
      console.log(`✅ Updated ${user.id} with role ${user.role}`);
    }
  }
}

// (async () => {
//   try {
//     await setUserRoles();
//   } catch (err) {
//     console.error("Unexpected error:", err);
//   }
// })();
setUserRoles().catch((err) => {
  console.error("Unexpected error:", err);
});
