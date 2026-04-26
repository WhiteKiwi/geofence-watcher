import { mkdir, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

import type { DomainStorage } from "../../storage/index.js";
import { isHelpCommand, printJson, requiredOption } from "../helpers.js";
import { printCommandHelp } from "./help.js";
import type { ParsedCommand } from "../parser.js";

type InstallCronResult = {
  label: string;
  plistPath: string;
  everySeconds: number;
  command: string[];
  loaded: boolean;
};

const LABEL = "link.whitekiwi.geofence-watcher.watch";

export async function handleInstallCron(
  command: ParsedCommand,
  _storage: DomainStorage,
): Promise<void> {
  void _storage;

  if (isHelpCommand(command.command)) {
    printCommandHelp("install-cron");
    return;
  }

  const every = requiredOption(command.options, "every");
  const everySeconds = parseEveryToSeconds(every);
  const launchAgentsDirectory = join(homedir(), "Library", "LaunchAgents");
  const plistPath = join(launchAgentsDirectory, `${LABEL}.plist`);
  const executablePath = resolveExecutablePath("geofence-watcher");
  const programArguments = [executablePath, "watch"];
  const plist = buildPlist(programArguments, everySeconds);

  await mkdir(launchAgentsDirectory, { recursive: true });
  await writeFile(plistPath, plist, "utf8");

  const uid = typeof process.getuid === "function" ? process.getuid() : null;
  const launchctlTarget = uid === null ? "gui" : `gui/${uid}`;
  spawnSync("launchctl", ["bootout", launchctlTarget, plistPath], {
    stdio: "ignore",
  });
  const bootstrapResult = spawnSync("launchctl", ["bootstrap", launchctlTarget, plistPath], {
    stdio: "ignore",
  });
  const enableResult = spawnSync("launchctl", ["enable", `${launchctlTarget}/${LABEL}`], {
    stdio: "ignore",
  });

  const loaded = bootstrapResult.status === 0 || enableResult.status === 0;

  printJson({
    label: LABEL,
    plistPath,
    everySeconds,
    command: programArguments,
    loaded,
  } satisfies InstallCronResult);
}

function resolveExecutablePath(commandName: string): string {
  const result = spawnSync("which", [commandName], {
    encoding: "utf8",
  });

  if (result.status !== 0) {
    throw new Error(`Unable to find executable on PATH: ${commandName}`);
  }

  const executablePath = result.stdout.trim();

  if (!executablePath) {
    throw new Error(`Unable to find executable on PATH: ${commandName}`);
  }

  return executablePath;
}

function parseEveryToSeconds(every: string): number {
  const match = /^(\d+)([smh])$/.exec(every);

  if (!match) {
    throw new Error(`Invalid --every value: ${every}`);
  }

  const amount = Number(match[1]);
  const unit = match[2];

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error(`Invalid --every value: ${every}`);
  }

  switch (unit) {
    case "s":
      return amount;
    case "m":
      return amount * 60;
    case "h":
      return amount * 60 * 60;
    default:
      throw new Error(`Invalid --every value: ${every}`);
  }
}

function buildPlist(command: string[], everySeconds: number): string {
  const pathEntries = buildLaunchdPathEntries().join(":");
  const environmentPath = process.env.PATH ? `${process.env.PATH}:${pathEntries}` : pathEntries;
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>Label</key>
    <string>${LABEL}</string>
    <key>ProgramArguments</key>
    <array>
${command.map((part) => `      <string>${escapeXml(part)}</string>`).join("\n")}
    </array>
    <key>StartInterval</key>
    <integer>${everySeconds}</integer>
    <key>EnvironmentVariables</key>
    <dict>
      <key>PATH</key>
      <string>${escapeXml(environmentPath)}</string>
    </dict>
    <key>RunAtLoad</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/dev/null</string>
    <key>StandardErrorPath</key>
    <string>/dev/null</string>
  </dict>
</plist>
`;
}

function buildLaunchdPathEntries(): string[] {
  const home = homedir();
  const pnpmHome = process.env.PNPM_HOME;

  return [
    pnpmHome,
    join(home, "Library", "pnpm"),
    join(home, ".local", "share", "pnpm"),
    "/opt/homebrew/bin",
    "/usr/local/bin",
    "/usr/bin",
    "/bin",
    "/usr/sbin",
    "/sbin",
  ].filter((entry): entry is string => Boolean(entry));
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
