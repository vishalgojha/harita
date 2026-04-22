import { spawn, spawnSync } from "node:child_process";
import { copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { fileURLToPath } from "node:url";

const currentDir = fileURLToPath(new URL(".", import.meta.url));
const projectRoot = resolve(currentDir, "..");
const envExamplePath = resolve(projectRoot, ".env.example");
const envLocalPath = resolve(projectRoot, ".env.local");

const rl = createInterface({ input: stdin, output: stdout });

type EnvMap = Record<string, string>;

function section(title: string) {
  console.log(`\n=== ${title} ===`);
}

function parseEnvFile(filePath: string) {
  const map: EnvMap = {};
  if (!existsSync(filePath)) {
    return map;
  }

  const lines = readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }
    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    map[key] = value;
  }
  return map;
}

function writeEnvFile(values: EnvMap) {
  const preferredOrder = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASE_PROJECT_REF",
    "SUPABASE_DB_PASSWORD",
    "SUPABASE_ACCESS_TOKEN",
    "SEED_PROJECT_NAME",
    "SEED_PROJECT_TARGET_RATING",
    "SEED_OWNER_USER_ID",
    "PLAYWRIGHT_BASE_URL",
  ];

  const lines = preferredOrder.map((key) => `${key}=${values[key] ?? ""}`);
  writeFileSync(envLocalPath, `${lines.join("\n")}\n`, "utf8");
}

function commandExists(command: string) {
  const checker = process.platform === "win32" ? "where.exe" : "which";
  const result = spawnSync(checker, [command], { stdio: "ignore" });
  return result.status === 0;
}

function runCommand(command: string, args: string[], options?: { env?: Record<string, string> }) {
  return new Promise<void>((resolvePromise, reject) => {
    const child = spawn(command, args, {
      cwd: projectRoot,
      stdio: "inherit",
      shell: false,
      env: {
        ...process.env,
        ...options?.env,
      },
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolvePromise();
        return;
      }
      reject(new Error(`${command} ${args.join(" ")} failed with exit code ${code ?? "unknown"}.`));
    });
    child.on("error", reject);
  });
}

async function ask(question: string, currentValue = "", secret = false) {
  const suffix = currentValue ? ` [current: ${secret ? "••••••" : currentValue}]` : "";
  const answer = (await rl.question(`${question}${suffix}: `)).trim();
  return answer || currentValue;
}

async function confirm(question: string, defaultYes = true) {
  const hint = defaultYes ? "Y/n" : "y/N";
  const answer = (await rl.question(`${question} (${hint}): `)).trim().toLowerCase();
  if (!answer) {
    return defaultYes;
  }
  return answer === "y" || answer === "yes";
}

function bunCommand() {
  return process.platform === "win32" ? "bun.exe" : "bun";
}

function npxCommand() {
  return process.platform === "win32" ? "npx.cmd" : "npx";
}

async function installDependencies() {
  section("Dependencies");
  console.log("This will run bun install so the app, onboarding tooling, and Playwright smoke script are ready.");
  if (await confirm("Run bun install now?", true)) {
    await runCommand(bunCommand(), ["install"]);
  }
}

async function configureEnv() {
  section("Environment");
  if (!existsSync(envLocalPath)) {
    copyFileSync(envExamplePath, envLocalPath);
    console.log("Created .env.local from .env.example");
  }

  const envValues = parseEnvFile(envLocalPath);
  envValues.NEXT_PUBLIC_SUPABASE_URL = await ask(
    "Paste NEXT_PUBLIC_SUPABASE_URL",
    envValues.NEXT_PUBLIC_SUPABASE_URL ?? "",
  );
  envValues.NEXT_PUBLIC_SUPABASE_ANON_KEY = await ask(
    "Paste NEXT_PUBLIC_SUPABASE_ANON_KEY",
    envValues.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    true,
  );
  envValues.SUPABASE_SERVICE_ROLE_KEY = await ask(
    "Paste SUPABASE_SERVICE_ROLE_KEY (needed for seed command)",
    envValues.SUPABASE_SERVICE_ROLE_KEY ?? "",
    true,
  );
  envValues.SUPABASE_PROJECT_REF = await ask(
    "Optional: Supabase project ref for migration automation",
    envValues.SUPABASE_PROJECT_REF ?? "",
  );
  envValues.SUPABASE_DB_PASSWORD = await ask(
    "Optional: Supabase database password for migration automation",
    envValues.SUPABASE_DB_PASSWORD ?? "",
    true,
  );
  envValues.SUPABASE_ACCESS_TOKEN = await ask(
    "Optional: Supabase access token for CLI automation",
    envValues.SUPABASE_ACCESS_TOKEN ?? "",
    true,
  );
  envValues.SEED_PROJECT_NAME = await ask(
    "Optional: default seed project name",
    envValues.SEED_PROJECT_NAME ?? "HaritaDocs Seed Project",
  );
  envValues.SEED_PROJECT_TARGET_RATING = await ask(
    "Optional: default seed target rating",
    envValues.SEED_PROJECT_TARGET_RATING ?? "Gold",
  );
  envValues.SEED_OWNER_USER_ID = await ask(
    "Optional: owner user id for the seed project",
    envValues.SEED_OWNER_USER_ID ?? "",
  );
  envValues.PLAYWRIGHT_BASE_URL = await ask(
    "Optional: local app URL for smoke tests",
    envValues.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3010",
  );
  writeEnvFile(envValues);
  console.log(".env.local updated.");
  return envValues;
}

async function maybeApplyMigration(envValues: EnvMap) {
  section("Supabase Migration");
  const hasAutomationInputs =
    envValues.SUPABASE_PROJECT_REF &&
    envValues.SUPABASE_DB_PASSWORD &&
    envValues.SUPABASE_ACCESS_TOKEN;

  if (!hasAutomationInputs) {
    console.log(
      "Skipping automatic migration because SUPABASE_PROJECT_REF, SUPABASE_DB_PASSWORD, or SUPABASE_ACCESS_TOKEN is missing.",
    );
    console.log("You can still rerun onboarding later after filling those values.");
    return;
  }

  if (!(await confirm("Apply supabase/migrations/0001_initial.sql to the linked Supabase project now?", true))) {
    return;
  }

  const cliEnv = { SUPABASE_ACCESS_TOKEN: envValues.SUPABASE_ACCESS_TOKEN };
  await runCommand(
    npxCommand(),
    [
      "supabase",
      "link",
      "--project-ref",
      envValues.SUPABASE_PROJECT_REF,
      "--password",
      envValues.SUPABASE_DB_PASSWORD,
      "--yes",
    ],
    { env: cliEnv },
  );
  await runCommand(
    npxCommand(),
    ["supabase", "db", "push", "--linked", "--password", envValues.SUPABASE_DB_PASSWORD, "--yes"],
    { env: cliEnv },
  );
}

async function maybeSeed(envValues: EnvMap) {
  section("Seed Project");
  if (!envValues.SUPABASE_SERVICE_ROLE_KEY) {
    console.log("Skipping seed because SUPABASE_SERVICE_ROLE_KEY is empty.");
    return;
  }

  if (!(await confirm("Create a first sample project now?", true))) {
    return;
  }

  const args = [
    "run",
    "seed",
    "--",
    envValues.SEED_PROJECT_NAME || "HaritaDocs Seed Project",
    envValues.SEED_PROJECT_TARGET_RATING || "Gold",
  ];
  if (envValues.SEED_OWNER_USER_ID) {
    args.push(envValues.SEED_OWNER_USER_ID);
  }
  await runCommand(bunCommand(), args);
}

async function maybeLaunchStudio() {
  section("Launch");
  console.log("The guided dev launcher starts Next.js, waits for the app URL, and can run the Playwright smoke test.");
  if (await confirm("Launch the guided local studio now?", true)) {
    await runCommand(bunCommand(), ["run", "dev:guided"]);
  }
}

async function main() {
  console.log("HaritaDocs onboarding");
  console.log("This wizard keeps the setup linear for non-technical users: install, env, migration, seed, launch.");

  if (!commandExists("bun")) {
    console.error("Bun is not installed. On Windows, run .\\scripts\\onboard.ps1 to install bun automatically first.");
    process.exit(1);
  }

  try {
    await installDependencies();
    const envValues = await configureEnv();
    await maybeApplyMigration(envValues);
    await maybeSeed(envValues);
    await maybeLaunchStudio();
  } finally {
    rl.close();
  }
}

main().catch((error) => {
  rl.close();
  console.error("\nOnboarding stopped.");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
