const { Films, Actors } = require('../../model')

const ApiError = require('../ApiError')
const formatFilm = require('./format')

const validatorRules = {
  id: ['required', 'integer']
}

const execute = async ({ id }) => {
  const film = await Films.findByPk(id, {
    include: [{ model: Actors }]
  })

  if (!film) {
    throw new ApiError({ code: 'FILM_NOT_FOUND', message: 'Film not found' })
  }
  return formatFilm(film)
}

module.exports = { execute, validatorRules }
