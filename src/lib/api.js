export const AUTH_TOKEN_KEY = 'gallery_token';

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const headers = new Headers(options.headers || {});

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) headers.set('Authorization', ['Bearer', token].join(' '));

  let response;
  try {
    response = await fetch(`/api${path}`, { ...options, headers });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new Error('Cannot reach the MediaVault server. Start the app with "npm run dev" and try again.', { cause: error });
  }

  if (response.status === 204) return null;

  const responseBody = await response.text();
  let result;
  try {
    result = JSON.parse(responseBody);
  } catch (error) {
    if (!(error instanceof SyntaxError)) throw error;
    if (!response.ok) {
      throw new Error(`The API server returned an invalid response (HTTP ${response.status}). Make sure it is running with "npm run dev".`, { cause: error });
    }
    throw new Error('The API server returned an invalid response. Make sure it is running with "npm run dev".', { cause: error });
  }

  if (!response.ok) throw new Error(result.error || 'The request could not be completed.');
  return result;
}
