import { spawn } from "node:child_process";
import { once } from "node:events";

import { debug } from "../cli/logger.js";
import type { ShellAction } from "../domain/index.js";

export type ExecuteShellActionResult = {
  actionId: string;
  command: string;
  success: boolean;
  exitCode: number | null;
  error?: string;
};

export async function executeShellAction(
  action: ShellAction,
): Promise<ExecuteShellActionResult> {
  try {
    const shell = process.env.SHELL ?? "/bin/sh";
    debug("execute-shell-action: spawning shell", {
      actionId: action.id,
      shell,
      command: action.value.command,
    });
    const child = spawn(shell, ["-lc", action.value.command], {
      stdio: "inherit",
    });

    const [exitCode, signal] = (await once(child, "close")) as [number | null, NodeJS.Signals | null];

    const result: ExecuteShellActionResult = {
      actionId: action.id,
      command: action.value.command,
      success: exitCode === 0 && signal === null,
      exitCode,
      error:
        exitCode === 0 && signal === null
          ? undefined
          : signal
            ? `Action terminated by signal: ${signal}`
            : `Action failed with exit code ${exitCode ?? -1}`,
    };
    debug("execute-shell-action: completed", result);
    return result;
  } catch (error) {
    const result = {
      actionId: action.id,
      command: action.value.command,
      success: false,
      exitCode: null,
      error: error instanceof Error ? error.message : String(error),
    };
    debug("execute-shell-action: failed", result);
    return result;
  }
}
