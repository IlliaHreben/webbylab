const express = require('express')
const bodyParser = require('body-parser')

const controllers = require('./controllers')
const {handleError} = require('./controllers/middleware')

const api = express.Router()
  .use(handleError)
  .post('/film', controllers.films.create)
  .get('/film', controllers.films.info)
  .delete('/film', controllers.films.remove)
  .get('/films', controllers.films.getAll)
  .get('/findFilm', controllers.films.findOne)
  // .post('/importFilms', )



const app = express()
  .use(bodyParser.json())
  .use('/api', api)
  .listen(4000)
