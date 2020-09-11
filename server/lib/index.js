const express = require('express')
const bodyParser = require('body-parser')
const asyncHandler = require('express-async-handler')
const serveStatic = require('serve-static')

const { sequelize } = require('./model')
const controllers = require('./controllers/films')
const { handleError } = require('./controllers/middleware')
const { app: config } = require('./config')

const api = express.Router()
  .post('/film', asyncHandler(controllers.create))
  .get('/film', asyncHandler(controllers.info))
  .delete('/film', asyncHandler(controllers.remove))
  .get('/films', asyncHandler(controllers.findFilms))
  .post('/importFilms', asyncHandler(controllers.importFilms))
  .use(handleError)

const app = express()
  .use(serveStatic('../client/build', { extensions: ['html'] }))
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
  await sequelize.sync({ force: false })
  await listenPort(port)
  console.log('Succesfully started.')
}

startApp(config.port)
