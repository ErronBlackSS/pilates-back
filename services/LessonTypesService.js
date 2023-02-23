const pool = require('../db')
const LessonTypeHelper = require('../helpers/LessonTypeHelper')
const fs = require('fs')

async function saveImage (id, file) {
    try {
        const fileName = file.name
        const imageDirPath = process.env.FILE_PATH + '/lesson_types/' + id
        const server_path = imageDirPath + '/' + fileName

        await deleteLessonTypeImage(id)

        fs.mkdirSync(imageDirPath)
        file.mv(server_path)

        const api_url = process.env.API_URL + '/files/lesson_types/' + id + '/' + fileName

        await pool.query(`
          INSERT INTO lesson_type_image (lesson_type_id, image_name, image_server_path, image_url)
          VALUES ($1, $2, $3, $4) RETURNING *`,
          [id, fileName, server_path, api_url]
        )

        return api_url
    } catch (e) {
        console.log(e)
    }
}

async function deleteLessonTypeImage(lessonTypeId) {

  const imageDirPath = process.env.FILE_PATH + '/lesson_types/' + lessonTypeId

  if(fs.existsSync(imageDirPath)) {
    fs.rmSync(imageDirPath, { recursive: true })
  }

  await pool.query(`
    DELETE FROM lesson_type_image WHERE lesson_type_id = $1`,
    [lessonTypeId]
  )
}

async function checkImageExists (id) {
    try {
      const isImageDuplicated = await LessonTypeHelper.checkDuplicateImage(id)
  
      if (isImageDuplicated) {
        fs.unlink(lessonImage, (err) => {
          if (err) {
            console.log(err)
          }
        })
        await LessonTypeHelper.deleteImage(id)
      }
  
      return true
    } catch (e) {
      console.log(e)
    }
  }

module.exports = {
  saveImage,
  checkImageExists,
  deleteLessonTypeImage
}