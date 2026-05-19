import { DEFAULT_COMMIT_MESSAGES } from "../config/defaults.js";
import { choose } from "../utils/random.js";

const prefixes = ["", "chore: ", "docs: ", "maintenance: "];

export const generateCommitMessage = () => {
  const prefix = choose(prefixes);
  const message = choose(DEFAULT_COMMIT_MESSAGES);
  return `${prefix}${message}`.trim();
};
