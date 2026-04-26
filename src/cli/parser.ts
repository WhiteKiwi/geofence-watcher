export type Options = Record<string, string>;

export type ParsedCommand = {
  resource: string | undefined;
  command: string | undefined;
  args: string[];
  options: Options;
};

export function parseCommand(argv: string[]): ParsedCommand {
  const [resource, second, ...rest] = argv;
  const args: string[] = [];
  const options: Options = {};
  const helpRequested = second === "help" || second === "-h" || second === "--help";
  const command = helpRequested ? "help" : second?.startsWith("--") ? undefined : second;
  const optionArgs = helpRequested ? [] : second?.startsWith("--") ? [second, ...rest] : rest;

  for (let index = 0; index < optionArgs.length; index += 1) {
    const value = optionArgs[index];

    if (value?.startsWith("--")) {
      const optionName = value.slice(2);
      const optionValue = optionArgs[index + 1];

      if (!optionName || !optionValue || optionValue.startsWith("--")) {
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
