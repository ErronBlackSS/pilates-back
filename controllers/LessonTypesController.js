const pool = require('../db')
const helpers = require('../helpers/general')
const LessonTypeHelper = require('../helpers/LessonTypeHelper')
const LessonTypesService = require('../services/LessonTypesService')
const LessonTypeDTO = require('../dtos/LessonTypeDTO')
const fs = require('fs')

async function create (req, res, next) {
  try {
    const { title, description, global_lesson_type, duration, image } = req.body
    const newLessonType = await pool.query(`
      INSERT INTO lesson_types (title, description, global_lesson_type, duration) VALUES ($1, $2, $3, $4) RETURNING *`, 
      [title, description, global_lesson_type, duration]
    )
    const image_url = null
    if (image) {
      image_url = LessonTypesService.saveImage(newLessonType.rows[0].id ,image)
    }
    const lessonType = new LessonTypeDTO({...newLessonType.rows[0], image_url})
    res.json(lessonType)
  } catch (e) {
    next(e)
  }
}

async function getAll (req, res, next) {
  try {
    const lessonTypes = await pool.query('SELECT * from lesson_types LEFT JOIN lesson_type_image ON lesson_types.id = lesson_type_image.lesson_type_id')
    const lessonTypesDTO = lessonTypes.rows.map(lessonType => new LessonTypeDTO(lessonType))
    res.json(lessonTypesDTO)
  } catch (e) {
    next(e)
  }
}

async function getAllByGroup (req, res, next) {
  try {
    const lessonTypes = await pool.query('SELECT id, title, description, duration, global_lesson_type, lesson_type_image.image_url from lesson_types LEFT JOIN lesson_type_image ON lesson_types.id = lesson_type_image.lesson_type_id ORDER by lesson_types.global_lesson_type desc')
    let arr = {}
    lessonTypes.rows.forEach((lessonType) => {
      if (!arr.hasOwnProperty(lessonType.global_lesson_type)) {
        arr[lessonType.global_lesson_type] = []
        arr[lessonType.global_lesson_type].push(lessonType)
      } else {
        arr[lessonType.global_lesson_type].push(lessonType)
      }
    })
       
    res.json(arr)
  } catch (e) {
    next(e)
  }
}

async function update (req, res, next) {
  try {
    const { id, title, description, global_lesson_type, duration } = req.body
    const image = req.file
    const lesson_types = await pool.query(
      'UPDATE lesson_types SET title = $2, description = $3, global_lesson_type = $4, duration = $5 WHERE id = $1 RETURNING *',
      [id, title, description, global_lesson_type, duration]
    )
    const image_url = null
    if (image) {
      image_url = LessonTypesService.saveImage(lesson_types.rows[0].id ,image)
    }
    const lessonType = new LessonTypeDTO({...lesson_types.rows[0], image_url})
    res.json(lessonType)
  } catch (e) {
    next(e)
  }
}

async function remove (req, res, next) {
  try {
    const { id } = req.query
    const lessonType = await pool.query(`
      DELETE FROM lesson_types 
      WHERE id = $1`, 
      [id]
    )
    
    LessonTypesService.deleteLessonTypeImage(id)
    res.json(lessonType.rows[0])
  } catch (e) {
    next(e)
  }
}

async function saveLessonTypeImage(req, res) {
  const id = req.query.id
  const { file } = req.files
  const api_url = await LessonTypesService.saveImage(id, file)  
  res.json(api_url)
}

module.exports = {
    create,
    getAll,
    update,
    remove,
    getAllByGroup,
    saveLessonTypeImage
}