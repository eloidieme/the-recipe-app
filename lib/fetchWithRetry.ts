/**
 * Fetch with retry logic for handling transient network failures (DNS, timeouts, etc.)
 * Particularly useful in containerized environments where DNS resolution can be unreliable.
 */

interface FetchWithRetryOptions extends RequestInit {
  retries?: number;
  retryDelay?: number;
  next?: { revalidate?: number };
}

export async function fetchWithRetry(
  url: string,
  options: FetchWithRetryOptions = {},
): Promise<Response> {
  const { retries = 3, retryDelay = 1000, ...fetchOptions } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, fetchOptions);
      return response;
    } catch (error) {
      lastError = error as Error;

      // Check if it's a retryable error (DNS, network issues)
      const isRetryable =
        error instanceof TypeError ||
        (error as NodeJS.ErrnoException)?.code === "EAI_AGAIN" ||
        (error as NodeJS.ErrnoException)?.code === "ENOTFOUND" ||
        (error as NodeJS.ErrnoException)?.code === "ECONNRESET" ||
        (error as NodeJS.ErrnoException)?.code === "ETIMEDOUT";

      if (!isRetryable || attempt === retries) {
        throw error;
      }

      console.warn(
        `Fetch attempt ${attempt + 1} failed for ${url}, retrying in ${retryDelay}ms...`,
        error,
      );

      // Wait before retrying with exponential backoff
      await new Promise((resolve) =>
        setTimeout(resolve, retryDelay * Math.pow(2, attempt)),
      );
    }
  }

  throw lastError;
}
