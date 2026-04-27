const FLAG_OPTIONS = new Set(["debug"]);

export type Options = Record<string, string | boolean>;

export type ParsedCommand = {
  resource: string | undefined;
  command: string | undefined;
  args: string[];
  options: Options;
};

export function parseCommand(argv: string[]): ParsedCommand {
  const args: string[] = [];
  const options: Options = {};
  let index = 0;

  while (index < argv.length) {
    const value = argv[index];

    if (!value?.startsWith("--")) {
      break;
    }

    const optionName = value.slice(2);

    if (!FLAG_OPTIONS.has(optionName)) {
      break;
    }

    options[optionName] = true;
    index += 1;
  }

  const [resource, second, ...rest] = argv.slice(index);
  const helpRequested = second === "help" || second === "-h" || second === "--help";
  const command = helpRequested ? "help" : second?.startsWith("--") ? undefined : second;
  const optionArgs = helpRequested ? [] : second?.startsWith("--") ? [second, ...rest] : rest;

  for (let index = 0; index < optionArgs.length; index += 1) {
    const value = optionArgs[index];

    if (value?.startsWith("--")) {
      const optionName = value.slice(2);

      if (!optionName) {
        throw new Error(`Missing option name: ${value}`);
      }

      if (FLAG_OPTIONS.has(optionName)) {
        options[optionName] = true;
        continue;
      }

      const optionValue = optionArgs[index + 1];

      if (!optionValue || optionValue.startsWith("--")) {
        throw new Error(`Missing value for option: ${value}`);
      }

      options[optionName] = optionValue;
      index += 1;
      continue;
    }

    if (value) {
      args.push(value);
    }
  }

  return {
    resource,
    command,
    args,
    options,
  };
}
