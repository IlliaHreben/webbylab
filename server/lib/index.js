const express = require('express')
const bodyParser = require('body-parser')
const asyncHandler = require('express-async-handler')

const controllers = require('./controllers')
const {handleError} = require('./controllers/middleware')

const api = express.Router()
  .post('/film', asyncHandler(controllers.films.create))
  .get('/film', asyncHandler(controllers.films.info))
  .delete('/film', asyncHandler(controllers.films.remove))
  .get('/films', asyncHandler(controllers.films.getAll))
  .get('/findFilm', asyncHandler(controllers.films.findOne))
  // .post('/importFilms', )
  .use(handleError)



const app = express()
  .use(bodyParser.json())
  .use('/api', api)
  .listen(4000)
