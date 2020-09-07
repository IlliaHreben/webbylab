const runService = require('../services/runService')
const createFilm = runService(require('../services/films/create'))
const deleteFilm = runService(require('../services/films/delete'))
// const listActors = require('../services/films/list')

const create = async (req, res) => {

  const film = await createFilm(req.body)
  res.send({
    ok: true,
    data: {
      film
    }
  })

}

const remove = async (req, res) => {

  await deleteFilm(req.query)
  res.send({
    ok: true
  })

}


module.exports = {create, remove}
