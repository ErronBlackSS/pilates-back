require('dotenv').config()
const express = require('express')
const cors = require('cors')
const PORT = process.env.PORT || 8080
const UserRouter = require('./routes/UserRouter')
const LessonsRouter = require('./routes/LessonsRouter')
const LessonTypesRouter = require('./routes/LessonTypesRouter')
const ErrorMiddleware = require('./middlewares/ErrorMiddleware')
const fileUpload = require("express-fileupload")
const cookieParser = require('cookie-parser')
const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(fileUpload({}))

app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL
}));

app.use('/files', express.static('./files'));
app.use('/api', UserRouter)
app.use('/api', LessonsRouter)
app.use('/api', LessonTypesRouter)
app.use(ErrorMiddleware);

const start = async () => {
    try {
        app.listen(PORT, () => console.log(`Server started on port ${PORT}`))
    } catch (e) {
        console.log(e)
    }
}

start()

// require('dotenv').config()
// const express = require('express')
// const cors = require('cors')
// const PORT = process.env.PORT || 8080
// const UserRouter = require('./routes/UserRouter')
// const LessonsRouter = require('./routes/LessonsRouter')
// const LessonTypesRouter = require('./routes/LessonTypesRouter')
// const ErrorMiddleware = require('./middlewares/ErrorMiddleware')
// const fileUpload = require("express-fileupload")
// const cookieParser = require('cookie-parser')
// const fs = require('fs')
// const http = require('http')
// const https = require('https')
// const app = express()

// var options = {
//     key: fs.readFileSync('/etc/letsencrypt/live/1216649-cu21564.tw1.ru/privkey.pem'),
//     cert: fs.readFileSync('/etc/letsencrypt/live/1216649-cu21564.tw1.ru/cert.pem'),
// };

// console.log(process.env, 'config file')
// app.use(express.json())
// app.use(cookieParser())
// app.use(fileUpload({}))

// console.log(process.env.CLIENT_URL, 'client url');

// app.use(cors({
//     credentials: true,
//     origin: process.env.CLIENT_URL
// }));

// app.use('/files', express.static('./files'));
// app.use('/api', UserRouter)
// app.use('/api', LessonsRouter)
// app.use('/api', LessonTypesRouter)
// app.use(ErrorMiddleware);

// var server = https.createServer(options, app).listen(PORT)