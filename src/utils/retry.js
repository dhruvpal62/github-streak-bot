export const withRetry = async (operation, options = {}) => {
  const retries = options.retries ?? 3;
  const delayMs = options.delayMs ?? 1_000;
  let lastError;

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      return await operation(attempt);
    } catch (error) {
      lastError = error;
      if (attempt === retries) break;
      await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
    }
  }

  throw lastError;
};
