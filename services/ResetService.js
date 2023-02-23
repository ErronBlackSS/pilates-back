const pool = require('../db')
const ResetHelpers = require('../helpers/ResetHelpers')

async function saveToken (user_id, token) {
  const candidate = await ResetHelpers.findOne({ field: 'user_id', value: user_id })
  if (!candidate) {
    await removeToken(user_id)
  }
  const newToken = await pool.query(`INSERT INTO reset_tokens (user_id, resetToken) VALUES ($1, $2)`, [user_id, token])
  return newToken
}

async function removeToken (userId) {
  const deletedToken = await pool.query(`DELETE FROM reset_tokens WHERE user_id = $1`, [userId])
  return deletedToken
}

module.exports = {
    saveToken,
    removeToken
}