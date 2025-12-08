import path from "node:path";
import { logger } from "@playground/shared-types";
import { getSupabaseAdmin } from "@playground/supabase";
import dotenv from "dotenv";

// Load environment variables from .env
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  logger.error(
    "Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.",
  );
  process.exit(1);
}

const supabase = getSupabaseAdmin(supabaseUrl, serviceRoleKey);

const defaultPassword = process.env.SEED_USER_PASSWORD || "password123";

const users = [
  // Admins
  { email: "luis@refugies.info", password: defaultPassword, role: "admin" },
  { email: "jeremie@refugies.info", password: defaultPassword, role: "admin" },
  { email: "margot@refugies.info", password: defaultPassword, role: "admin" },
  { email: "nour@refugies.info", password: defaultPassword, role: "admin" },
  { email: "julie@refugies.info", password: defaultPassword, role: "admin" },
  // Editors
  { email: "alice@refugies.info", password: defaultPassword, role: "editor" },
  { email: "claudia@refugies.info", password: defaultPassword, role: "editor" },
  { email: "xavier@refugies.info", password: defaultPassword, role: "editor" },
];

async function seedUsers() {
  logger.info(`Seeding ${users.length} users...`);

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

        logger.info(`Updating user ${user.email}...`);
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          existingUser.id,
          { password: user.password, user_metadata: { role: user.role } },
        );

        if (updateError) throw updateError;
      } else {
        logger.info(`Creating user ${user.email}...`);
        const { error: createError } = await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          user_metadata: { role: user.role },
          email_confirm: true,
        });

        if (createError) throw createError;
      }
    } catch (error) {
      logger.error(error, `Failed to process user ${user.email}`);
    }
  }

  logger.info("User seeding completed.");
}

seedUsers().catch((err) => {
  logger.error(err, "Unexpected error");
  process.exit(1);
});
