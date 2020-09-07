const express = require('express')
const bodyParser = require('body-parser')

const controllers = require('./controllers')
const {handleError} = require('./controllers/middleware')

const api = express.Router()
  .use(handleError)
  .post('/film', controllers.films.create)
  // .get('/film', )
  // .delete('/film', )
  // .get('/films', )
  // .get('/findFilm', )
  // .post('/importFilms', )



const app = express()
  .use(bodyParser.json())
  .use('/api', api)
  .listen(4000)
