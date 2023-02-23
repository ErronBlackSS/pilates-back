const UserService = require('../services/UserService')
const UserHelpers = require('../helpers/UserHelpers')
const { validationResult } = require('express-validator')
const ApiError = require('../exceptions/ApiError')
const helpers = require('../helpers/general')
const pool = require('../db')
const logger = require('../logger')
const { ROLES } = require('../constants')
const fs = require('fs')
const e = require('express')

async function registration (req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))
    }
    const { name, email, phone, password, lastname } = req.body
    const userData = await UserService.registration(name, email, phone, password, lastname)
    res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })
    const message = 'Пользователь ' + email + ' зарегистрирован'
    logger.info(message)
    res.json(userData)
  } catch (e) {
    next(e)
  }
}

async function login (req, res, next) {
  try {
    const {email, password} = req.body
    const userData = await UserService.login(email, password)
    res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })
    const message = 'Пользователь ' + email + ' вошел'
    logger.info(message)
    return res.json(userData)
  } catch (e) {
    next(e);
  }
}

async function reset (req, res, next) {
  try {
    const { email } = req.body
    const user = await UserService.resetSendMail(email)
    res.json(user)
  } catch (e) {
    next(e)
  }
}

async function resetPassword (req, res, next) {
  try {
    const { user_id, password } = req.body
    const userData = await UserService.resetPassword(user_id, password)
    res.json(userData)
  } catch (e) {
    next(e)
  }
}

async function activateReset (req, res, next) {
  try {
    const reset_link = req.params.link
    return res.redirect(process.env.CLIENT_URL + '/reset/' + reset_link)
  } catch (e) {
    next(e)
  }
}

async function logout(req, res, next) {
  try {
    const { refreshToken } = req.cookies
    const token = await UserService.logout(refreshToken)
    res.clearCookie('refreshToken')
    return res.json(token)
  } catch (e) {
    next(e)
  }
}

async function refresh(req, res, next) {
  try {
    const {refreshToken} = req.cookies;
    const userData = await UserService.refresh(refreshToken);
    res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
    return res.json(userData);
  } catch (e) {
    console.log(e, 'error')
    next(e);
  }
}

async function activate (req, res, next) {
  try {
    const activationLink = req.params.link
    await UserService.activate(activationLink)
    return res.redirect(process.env.CLIENT_URL)
  } catch (e) {
    next(e)
  }
}

async function getUsers (req, res, next) {
  try {
    const users = await UserHelpers.getAllUsers()
    logger.info('Получить всех пользователей')
    res.json(users)
  } catch (e) {
    next(e)
  }
}

async function update (req, res, next) {
  try {
    const query = helpers.parseUpdateData(req.body, 'users')
    const user = await pool.query(query, [])
    res.json(user.rows[0])
  } catch (e) {
    next(e)
  }
}

async function remove (req, res, next) {
  try {
    const { id } = req.body
    await pool.query(`
      DELETE FROM users 
      WHERE id = $1`, 
      [id]
    )
    res.json({ message: 'Пользователь удален' })
  } catch (e) {
    next(e)
  }
}

async function setCoachRole (req, res, next) {
  try {
    const { id } = req.body
    await pool.query('UPDATE users SET role = $1 WHERE id = $2 RETURNING *', [ROLES.COACH, id])
    res.json({ message: 'success' })
  } catch (e) {
    next(e)
  }
}

async function setUserRole (req, res, next) {
  try {
    const { id } = req.body
    await pool.query('UPDATE users SET role = $1 WHERE id = $2 RETURNING *', [ROLES.USER, id])
    res.json({ message: 'success' })
  } catch (e) {
    next(e)
  }
}

async function saveImage (req, res, next) {
  try {
    const id = req.query.id
    const file = req.files
    const fileName = file.file.name
    const server_path = process.env.FILE_PATH + '/user_photos/' + fileName
    file.file.mv(server_path)
    const api_url = process.env.API_URL + '/files/user_photos/' + fileName

    const currentPhoto = await UserHelpers.checkImageExists(id)

    if (currentPhoto) {
      fs.unlink(currentPhoto.image_server_path, (err) => {
        if (err) {
          console.log(err)
        }
      })
      await UserHelpers.deleteImage(id)
    }

    await pool.query(`
      INSERT INTO user_photo (user_id, image_name, image_server_path, image_url)
      VALUES ($1, $2, $3, $4) RETURNING *`,
      [id, fileName, server_path, api_url]
    )

    res.json(api_url)
  } catch (e) {
    next(e)
  }
}

async function setAdminRole (req, res, next) {
  try {
    const { id } = req.body
    await pool.query('UPDATE users SET role = $1 WHERE id = $2 RETURNING *', [ROLES.ADMIN, id])
    res.json({ message: 'success' })
  } catch (e) {
    next(e)
  }
}

async function getTrainers (req, res, next) {
  try {
    const coaches = await pool.query(`
      SELECT users.id, users.email, users.role, users.name, users.lastname, users.phone, user_photo.image_url, trainer_info.*
      FROM users 
      LEFT JOIN user_photo ON user_photo.user_id = users.id
      LEFT JOIN trainer_info ON trainer_info.trainer_id = users.id
      WHERE name = 'Екатерина' and lastname = 'Федоровская' and role = 'a3ee77b5-dd34-4a63-a460-7eb53eb6e560'
      union all
      SELECT users.id, users.email, users.role, users.name, users.lastname, users.phone, user_photo.image_url, trainer_info.*
      FROM users 
      LEFT JOIN user_photo ON user_photo.user_id = users.id
      LEFT JOIN trainer_info ON trainer_info.trainer_id = users.id
      WHERE role = $1 and name != 'Екатерина' and lastname != 'Федоровская'`,
    [ROLES.COACH])
    
    res.json(coaches.rows)
  } catch (e) {
    //next(e)
  }
}

async function changeUserPassword (req, res, next) {
  try {
    const userId = req.query.id
    const { oldPassword, newPassword } = req.body

    const newPasswordSetted = await UserService.changeUserPassword(userId, oldPassword, newPassword)
    
    res.json(newPasswordSetted)
  } catch (e) {
    next(e)
  }
}

async function getUserByResetToken (req, res, next) {
  try {
    const reset_link = req.params.link
    const user = await UserHelpers.getUserByResetToken(reset_link)
    res.json(user)
  } catch (e) {
    next(e)
  }
}

async function updateUserData(req, res, next) {
  try {
    const { id } = req.query
    const { name, lastname, email, phone } = req.body
    const user = await pool.query(`
      UPDATE users SET name = $1, lastname = $2, email = $3, phone = $4 WHERE id = $5
    `, [name, lastname, email, phone, id])

    return user.rows[0]
  } catch(e) {
    next(e)
  }
}

async function getTrainerInfo(req, res, next) {
  try {
    const { id } = req.query
    const trainerInfo = await pool.query(`
      SELECT * FROM trainer_info WHERE trainer_id = $1
    `, [id])
    
    res.json(trainerInfo.rows[0])
  } catch(e) {
    next(e)
  }
}

async function createTrainerInfo(req, res, next) {
  try {
    const { id } = req.query

    const { education, certificates, achievements, experience, directions } = req.body

    await pool.query(`
      INSERT INTO trainer_info (trainer_id, education, certificates, personal_achievements, work_experience, directions)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING * 
    `, [id, education, certificates, achievements, experience, directions])

  } catch(e) {
    next(e)
  }
}

async function updateTrainerInfo(req, res, next) {
  try {
    const { id } = req.query

    const { education, certificates, achievements, experience, directions } = req.body

    await pool.query(`
      UPDATE trainer_info SET education = $1, certificates = $2, personal_achievements = $3, work_experience = $4, directions = $5
      WHERE trainer_id = $6
    `, [education, certificates, achievements, experience, directions, id])

  } catch(e) {
    next(e)
  }
}

module.exports = {
  registration,
  login,
  logout,
  reset,
  resetPassword,
  refresh,
  activate,
  update,
  remove,
  activateReset,
  getUserByResetToken,
  getUsers,
  setCoachRole,
  setUserRole,
  setAdminRole,
  getTrainers,
  saveImage,
  updateUserData,
  getTrainerInfo,
  createTrainerInfo,
  updateTrainerInfo,
  changeUserPassword
}