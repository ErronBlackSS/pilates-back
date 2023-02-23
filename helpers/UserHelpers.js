const helpers = require('../helpers/general')
const pool = require('../db')

async function findOne (params) {
    const user = await pool.query(`
        SELECT users.id, users.password, users.email, users.role, users.name, users.lastname, users.phone, user_photo.image_url, users.is_activated
        from users LEFT JOIN user_photo ON users.id = user_photo.user_id
        WHERE users.${params.field} = $1`, [params.value])

    return user.rows[0]
}

async function getAllUsers () {
    const users = await pool.query(`
        SELECT users.id, users.email, users.role, users.name, users.lastname, users.phone, user_photo.image_url
        from users 
        LEFT JOIN user_photo ON users.id = user_photo.user_id
        where users.role = '9bd2b9fc-446b-44ad-bbcd-d97c71004f5d'
        order by users.name, users.lastname`)
    return users.rows
}

async function checkOldPassword(userId, oldPassword) {
    const correctPassword = await pool.query(`
        SELECT * from users where id = $1 and password = $2
   `, [userId, oldPassword])
   console.log(correctPassword.rows.length, 'correct?')
   return correctPassword.rows.length
}

async function update (user) {
  const query = helpers.parseUpdateData(user, 'users')
  const updatedUser = await pool.query(query + 'RETURNING *', [])
  return updatedUser.rows[0]
}

async function create (user) {
    const { name, email, hashPassword, lastname, phone, activation_link } = user
    const newUser = await pool.query(`
        INSERT INTO users (name, email, phone, password, lastname, activation_link)
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, phone, is_activated, lastname, activation_link`, 
        [name, email, phone, hashPassword, lastname, activation_link]
    )
    return newUser.rows[0]
}

async function checkImageExists (id) {
    const image = await pool.query(`SELECT image_server_path from user_photo WHERE user_id = $1`, [id])
    return image.rows[0]
}

async function getUserByResetToken (reset_link) {
    const user = await pool.query(`SELECT * from reset_tokens WHERE resetToken = $1`, [reset_link])
    return user.rows[0]
}

async function deleteImage (id) {
    const image = await pool.query(`DELETE from user_photo WHERE user_id = $1`, [id])
    return image.rows[0]
}

module.exports = {
    findOne,
    getAllUsers,
    create,
    update,
    getUserByResetToken,
    checkImageExists,
    deleteImage,
    checkOldPassword
}