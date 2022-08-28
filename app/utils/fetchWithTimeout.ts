export async function fetchWithTimeout(
  resource: Request | string,
  options?: { timeout: number }
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 1000);
  const response = await fetch(resource, {
    ...options,
    signal: controller.signal,
  });
  clearTimeout(id);
  return response;
}
