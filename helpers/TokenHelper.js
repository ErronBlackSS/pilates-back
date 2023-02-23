const pool = require('../db')

async function findOne (payload) {
    const token = await pool.query(`SELECT * from tokens WHERE ${payload.field} = $1`, [payload.value])
    return token.rows[0]
}

async function deleteOne (payload) {
    const deletedToken = await pool.query(`DELETE FROM tokens WHERE ${payload.field} = $1`, [payload.value])
    return deletedToken.rows[0]
}

async function create (userId, refreshToken) {
    const newToken = await pool.query(`
        INSERT INTO tokens (user_id, refreshtoken) 
        VALUES ($1, $2)`, 
        [userId, refreshToken]
    )
    return newToken.rows[0]
}

async function updateRefresh (refreshToken, userId) {
    const updatedToken = await pool.query(`
        UPDATE tokens
        SET refreshtoken = $1
        WHERE user_id = $2`,
        [refreshToken, userId]
    )
    return updatedToken.rows[0]
}

module.exports = {
    findOne,
    deleteOne,
    create,
    updateRefresh
}