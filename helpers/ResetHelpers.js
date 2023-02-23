const pool = require('../db')

async function findOne (payload) {
    const token = await pool.query(`SELECT * from reset_tokens WHERE ${payload.field} = $1`, [payload.value])
    return token.rows[0]
}

module.exports = {
    findOne
}