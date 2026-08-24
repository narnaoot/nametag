const db = require('../db');

// Look up an account's current token_version. Returns the integer, or null if
// the user no longer exists (e.g. the account was deleted). Kept in its own
// module so route tests can mock the revocation lookup without touching their
// db.query mock sequences.
module.exports = async function currentTokenVersion(userId) {
  const result = await db.query('SELECT token_version FROM users WHERE id = $1', [userId]);
  return result.rows[0] ? result.rows[0].token_version : null;
};
