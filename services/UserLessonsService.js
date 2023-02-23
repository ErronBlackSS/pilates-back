const pool = require('../db')
const LessonsHelper = require('../helpers/LessonsHelper')

async function getUserLessonsCurrentWeek(req, res) {
  try {    
    const user_id = req.query.user_id
    const { start, end } = req.query.week
    const lessons = await pool.query(`
      SELECT lessons.coach_id, users."name", users."lastname", lessons.id as lesson_id, lesson_types.title, lesson_types.description, lessons.date, lessons.start_time, lessons.end_time, lessons.capacity
      FROM users_lessons_rel 
      JOIN lessons ON lessons.id = users_lessons_rel.lesson_id
      JOIN lesson_types ON lesson_types.id = lessons.lesson_type_id
      JOIN users ON users.id = lessons.coach_id
      WHERE users_lessons_rel.user_id = $1 and lessons.date BETWEEN $2 and $3`,
    [user_id, start, end])
    
    //const { trainings, weekDays } = LessonsHelper.getFormattedLessons(lessons, start)
    res.json(lessons.rows)
  }
  catch (e) {
    //next(e)
    console.log(e)
  }
}

async function getUserPlannedLessons(req, res) {
  try {    
    const { user_id } = req.query
    const lessons = await pool.query(`
      SELECT lessons.coach_id, users."name", users."lastname", lessons.id as lesson_id, lesson_types.title, lesson_types.description, lessons.date, lessons.start_time, lessons.end_time, lessons.capacity
      FROM users_lessons_rel 
      JOIN lessons ON lessons.id = users_lessons_rel.lesson_id
      JOIN lesson_types ON lesson_types.id = lessons.lesson_type_id
      JOIN users ON users.id = lessons.coach_id
      WHERE users_lessons_rel.user_id = $1 and lessons.date > now()`,
    [user_id])
    res.json(lessons.rows)
  }
  catch (e) {
    console.log(e)
  }
}

async function getUserHistoryLessons(req, res) {
  try {
    const { user_id } = req.query
    
    const lessons = await pool.query(`
      SELECT lessons.coach_id, users."name", users."lastname", lessons.id as lesson_id, lesson_types.title, lesson_types.description, lessons.date, lessons.start_time, lessons.end_time, lessons.capacity
      FROM users_lessons_rel 
      JOIN lessons ON lessons.id = users_lessons_rel.lesson_id
      JOIN lesson_types ON lesson_types.id = lessons.lesson_type_id
      JOIN users ON users.id = lessons.coach_id
      WHERE users_lessons_rel.user_id = $1 and lessons.date < now()`,
    [user_id])
    
    res.json(lessons.rows)
  }
  catch (e) {
    console.log(e)
  }
}

module.exports = {
  getUserLessonsCurrentWeek,
  getUserPlannedLessons,
  getUserHistoryLessons
}