// const runService = require('../services/runService')
const createFilm = require('../services/films/create')
// const listActors = require('../services/films/list')

const create = async (req, res) => {

  const film = await createFilm.execute(req.body)
  res.send({
    ok: true,
    data: {
      film
    }
  })

}


module.exports = {create}
