const pool = require('../db')

async function getImagePath (id) {
    const lessonTypeImage = await pool.query(`
        SELECT * from lesson_type_image WHERE lesson_type_id = $1`, [id]
    )
    const image = lessonTypeImage.rows[0]
    return image?.image_server_path
}

async function deleteImage (id) {
   const image = await pool.query(`
        DELETE FROM lesson_type_image WHERE lesson_type_id = $1`, [id]
    )
    return image.rows[0]
}

async function checkDuplicateImage (id) {
    const lessonTypeImage = await pool.query(`
        SELECT * from lesson_type_image WHERE lesson_type_id = $1`, [id]
    )
    return lessonTypeImage.rows[0]
}

module.exports = {
  getImagePath,
  deleteImage,
  checkDuplicateImage
}