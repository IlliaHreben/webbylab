const express = require('express')

const controllers = require('./controllers')

const api = express.Router()
  .post('/film', )
  .get('/film', )
  .delete('/film', )
  .get('/films', )
  .get('/findFilm', )
  .post('/importFilms', )


const app = express()
  .use(bodyParser.json())
  .use('/api', api)
  .listen(4000)
