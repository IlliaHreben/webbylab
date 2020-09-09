const express = require('express')
const bodyParser = require('body-parser')
const asyncHandler = require('express-async-handler')

const { sequelize } = require('./model')
const controllers = require('./controllers')
const { handleError } = require('./controllers/middleware')

const api = express.Router()
  .post('/film', asyncHandler(controllers.films.create))
  .get('/film', asyncHandler(controllers.films.info))
  .delete('/film', asyncHandler(controllers.films.remove))
  .get('/films', asyncHandler(controllers.films.findFilms))
  .post('/importFilms', asyncHandler(controllers.films.importFilms))
  .use(handleError)

const app = express()
  .use(bodyParser.json())
  .use('/api', api)

const listenPort = port => {
  return new Promise((resolve, reject) => {
    app.listen(port, err => {
      err ? reject(err) : resolve()
    })
  })
}

const startApp = async port => {
  await sequelize.sync({ force: true })
  await listenPort(port)
  console.log('Succesfully started.')
}

startApp(4000)
