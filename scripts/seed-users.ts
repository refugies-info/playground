import "dotenv/config";
import crypto from "node:crypto";
import { LANGUAGES, logger } from "@playground/shared-types";
import { getSupabaseAdmin } from "@playground/supabase";

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

const defaultPassword = process.env.SEED_USER_PASSWORD;
let finalPassword = defaultPassword;

interface SeedUser {
  email: string;
  password?: string;
  role: "admin" | "editor" | "translator";
  language?: string;
}

if (!finalPassword) {
  finalPassword = crypto.randomBytes(16).toString("hex");
  logger.warn("SEED_USER_PASSWORD is not set in .env");
  logger.warn("Generated secure temporary password for this session:");
  logger.warn(`> ${finalPassword} <`);
  logger.warn(
    "Please copy this password or set SEED_USER_PASSWORD in your .env file.",
  );
}

const users: SeedUser[] = [
  // Admins / Developers
  { email: "luis@refugies.info", password: finalPassword, role: "admin" },
  { email: "jeremie@refugies.info", password: finalPassword, role: "admin" },
  { email: "julie@refugies.info", password: finalPassword, role: "admin" },
  { email: "nour@refugies.info", password: finalPassword, role: "admin" },
  { email: "margot@refugies.info", password: finalPassword, role: "admin" },

  // Editors
  { email: "editor@refugies.info", password: finalPassword, role: "editor" },
  { email: "alice@refugies.info", password: finalPassword, role: "editor" },
  { email: "claudia@refugies.info", password: finalPassword, role: "editor" },
  { email: "xavier@refugies.info", password: finalPassword, role: "editor" },

  // Translators (Generated from shared constants)
  ...LANGUAGES.map(
    (lang): SeedUser => ({
      email: `translator.${lang.code}@refugies.info`,
      password: finalPassword,
      role: "translator",
      language: lang.code,
    }),
  ),
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
          {
            password: user.password,
            user_metadata: {
              role: user.role,
              language: user.language,
            },
          },
        );

        if (updateError) throw updateError;
      } else {
        logger.info(`Creating user ${user.email}...`);
        const { error: createError } = await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          user_metadata: { role: user.role, language: user.language },
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
