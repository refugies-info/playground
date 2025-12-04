import path from "node:path";
import { getSupabaseAdmin } from "@playground/supabase";
import dotenv from "dotenv";

// Load environment variables from .env
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  // biome-ignore lint/suspicious/noConsole: Script needs logging
  console.error(
    "Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.",
  );
  process.exit(1);
}

const supabase = getSupabaseAdmin(supabaseUrl, serviceRoleKey);

const users = [
  // Admins
  { email: "luis@refugies.info", password: "admin", role: "admin" },
  { email: "jeremie@refugies.info", password: "admin", role: "admin" },
  { email: "margot@refugies.info", password: "admin", role: "admin" },
  { email: "nour@refugies.info", password: "admin", role: "admin" },
  { email: "julie@refugies.info", password: "admin", role: "admin" },
  // Editors
  { email: "alice@refugies.info", password: "editor", role: "editor" },
  { email: "claudia@refugies.info", password: "editor", role: "editor" },
  { email: "xavier@refugies.info", password: "editor", role: "editor" },
];

async function seedUsers() {
  // biome-ignore lint/suspicious/noConsole: Script needs logging
  console.log(`Seeding ${users.length} users...`);

  for (const user of users) {
    try {
      // Check if user exists
      const { data: existingUsers, error: searchError } =
        await supabase.auth.admin.listUsers();

      if (searchError) {
        throw searchError;
      }

      const existingUser = existingUsers.users.find(
        (u) => u.email === user.email,
      );

      if (existingUser) {
        // Update password if user exists
        // biome-ignore lint/suspicious/noConsole: Script needs logging
        console.log(`Updating user ${user.email}...`);
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          existingUser.id,
          { password: user.password, user_metadata: { role: user.role } },
        );

        if (updateError) throw updateError;
      } else {
        // biome-ignore lint/suspicious/noConsole: Script needs logging
        console.log(`Creating user ${user.email}...`);
        const { error: createError } = await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          user_metadata: { role: user.role },
          email_confirm: true,
        });

        if (createError) throw createError;
      }
    } catch (error) {
      // biome-ignore lint/suspicious/noConsole: Script needs logging
      console.error(`Failed to process user ${user.email}:`, error);
    }
  }

  // biome-ignore lint/suspicious/noConsole: Script needs logging
  console.log("User seeding completed.");
}

seedUsers().catch((err) => {
  // biome-ignore lint/suspicious/noConsole: Script needs logging
  console.error("Unexpected error:", err);
  process.exit(1);
});
