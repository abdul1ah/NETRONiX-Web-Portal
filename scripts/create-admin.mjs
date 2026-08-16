#!/usr/bin/env node
/**
 * Creates (or resets) an admin portal login.
 *
 *   npm run admin:create
 *
 * It hashes the password with bcrypt and, if SUPABASE_SERVICE_ROLE_KEY is set
 * in .env.local, writes the account straight into Supabase. If it is not set,
 * it prints a ready-to-paste SQL statement instead.
 *
 * The password is never stored or logged in plain text.
 */

import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import bcrypt from "bcryptjs";

// ─── Minimal .env.local loader (no extra dependency) ─────────────────────────

function loadEnv() {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) return;

  for (const line of readFileSync(path, "utf8").split("\n")) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!match) continue;

    const [, key, rawValue] = match;
    if (process.env[key]) continue;

    process.env[key] = rawValue.replace(/^["']|["']$/g, "");
  }
}

// ─── Password prompt that does not echo ──────────────────────────────────────

async function askHidden(rl, question) {
  const onData = (char) => {
    if (String(char) === "\r" || String(char) === "\n") return;
    stdout.write("\x1b[2K\x1b[200D" + question + "*".repeat(rl.line.length));
  };

  stdin.on("data", onData);
  const answer = await rl.question(question);
  stdin.off("data", onData);
  stdout.write("\n");

  return answer;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  loadEnv();

  const rl = createInterface({ input: stdin, output: stdout });

  console.log("\nNETRONiX — create an admin portal login\n");

  const username = (await rl.question("Username: ")).trim();
  if (!username) {
    console.error("\nA username is required.");
    process.exit(1);
  }

  const password = await askHidden(rl, "Password: ");
  if (password.length < 8) {
    console.error("\nUse a password of at least 8 characters.");
    process.exit(1);
  }

  const confirm = await askHidden(rl, "Confirm password: ");
  if (password !== confirm) {
    console.error("\nThose passwords do not match.");
    process.exit(1);
  }

  const displayName =
    (await rl.question("Display name (optional): ")).trim() || null;

  rl.close();

  const hash = await bcrypt.hash(password, 10);

  const url        = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.log(
      "\nSupabase credentials not found in .env.local.\n" +
        "Paste this into the Supabase SQL editor instead:\n"
    );
    console.log(
      `insert into public.admin_users (username, password_hash, display_name)\n` +
        `values ('${username.replace(/'/g, "''")}', '${hash}', ${
          displayName ? `'${displayName.replace(/'/g, "''")}'` : "null"
        })\n` +
        `on conflict (username) do update set password_hash = excluded.password_hash;\n`
    );
    return;
  }

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false },
  });

  const { error } = await supabase
    .from("admin_users")
    .upsert(
      { username, password_hash: hash, display_name: displayName },
      { onConflict: "username" }
    );

  if (error) {
    console.error("\nCould not save the admin user:", error.message);
    console.error(
      "\nHas supabase/schema.sql been run yet? The admin_users table must exist."
    );
    process.exit(1);
  }

  console.log(`\nAdmin "${username}" is ready. Sign in at /admin/login\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
