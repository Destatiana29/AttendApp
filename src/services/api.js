/**
 * api.js
 *
 * All network requests go through this module.
 * Throws a descriptive Error when response.ok is false so callers
 * (useFetch, login handler) can surface the message to the user.
 */

const BASE_URL = 'https://dummyjson.com';

/**
 * Generic fetch wrapper with error handling.
 * @param {string} path - API path, e.g. '/users?limit=30'
 * @returns {Promise<any>} Parsed JSON body
 * @throws {Error} When HTTP status is not 2xx
 */
async function request(path) {
  const response = await fetch(`${BASE_URL}${path}`);

  if (!response.ok) {
    throw new Error(`API Error ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch up to 30 users from DummyJSON.
 * Fields returned by DummyJSON: id, firstName, lastName, email,
 * username, password, role, image (among others).
 *
 * @returns {Promise<Object[]>} Array of user objects
 */
export async function fetchUsers() {
  const data = await request('/users?limit=30');
  return data.users;
}
