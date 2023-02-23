module.exports = class LessonTypeDto {
    id
    title
    description
    duration
    global_lesson_type
    image_url

    constructor(model) {
        this.id = model.id
        this.title = model.title
        this.description = model.description
        this.duration = model.duration
        this.type = model.global_lesson_type
        this.image_url = model.image_url
    }
}