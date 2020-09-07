// const runService = require('../services/runService')
const createFilm = require('../services/films/create')
// const listActors = require('../services/films/list')
const sendPromiseToClient = require('./responseController')

const create = (req, res) => {
  const filmPromise = async () => {
    try {
      // console.log(req.body)
      const film = await createFilm.execute(req.body)
      // console.log(film)
      return film

    } catch (err) {
      console.log(err)
    }
  }

  sendPromiseToClient(res, filmPromise())

}


module.exports = {create}
