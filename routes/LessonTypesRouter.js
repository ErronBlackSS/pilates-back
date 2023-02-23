const Router = require('express')
const router = new Router()
const LessonTypesController = require('../controllers/LessonTypesController')

router.get('/lesson_types', LessonTypesController.getAll)
router.get('/lesson_types/bygroup', LessonTypesController.getAllByGroup)
router.post('/lesson_types', LessonTypesController.create)
router.post('/lesson_types/update', LessonTypesController.update)
router.delete('/lesson_types', LessonTypesController.remove)
router.post('/lesson_types/image', LessonTypesController.saveLessonTypeImage)

module.exports = router
