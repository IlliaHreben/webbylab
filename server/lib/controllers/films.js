const runService = require('../services/runService')
const createFilm = runService(require('../services/films/create'))
const deleteFilm = runService(require('../services/films/delete'))
const getInfoFilm = runService(require('../services/films/info'))
const listFilms = runService(require('../services/films/list'))
// const findFilmsByActor = runService(require('../services/films/findByActor'))
// const listActors = require('../services/films/list')

const create = async (req, res) => {

  const film = await createFilm(req.body)
  res.send({
    ok: true,
    data: film
  })
}

const remove = async (req, res) => {

  await deleteFilm(req.query)
  res.send({
    ok: true
  })

}

const info = async (req, res) => {

  const film = await getInfoFilm(req.query)
  res.send({
    ok: true,
    data: film
  })

}

const getAll = async (_, res) => {

  const films = await getFilms()
  res.send({
    ok: true,
    data: films
  })

}

const findFilms = async (req, res) => {

  const films = await listFilms(req.query)
  res.send({
    ok: true,
    data: films
  })

}

module.exports = {create, remove, info, getAll, findFilms}
