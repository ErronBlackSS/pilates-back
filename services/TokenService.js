const jwt = require('jsonwebtoken');
const TokenHelper = require('../helpers/TokenHelper')

function generateTokens (payload) {
  const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {expiresIn: '30m'})
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {expiresIn: '30d'})
  return {
    accessToken,
    refreshToken
  }
}

async function saveToken (userId, refreshToken) {
    const tokenData = await TokenHelper.findOne({ field: 'user_id', value: userId })
    if (tokenData) {
        const updatedToken = await TokenHelper.updateRefresh(refreshToken, userId)
        return updatedToken
    }
    const token = await TokenHelper.create(userId, refreshToken)
    return token
}

async function removeToken(refreshToken) {
    const tokenData = await TokenHelper.deleteOne({ field: 'refreshtoken', value: refreshToken })
    return tokenData
}

async function findToken(refreshToken) {
    const tokenData = await TokenHelper.findOne({ field: 'refreshtoken', value: refreshToken })
    return tokenData
}

function validateAccessToken(token) {
    try {
        const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
        return userData
    } catch (e) {
        console.log(e)
    }
}

function validateRefreshToken(token) {
    try {
        const userData = jwt.verify(token, process.env.JWT_REFRESH_SECRET)
        return userData
    } catch (e) {
        console.log(e)
    }
}

module.exports = {
    generateTokens,
    saveToken,
    removeToken,
    findToken,
    validateAccessToken,
    validateRefreshToken
}