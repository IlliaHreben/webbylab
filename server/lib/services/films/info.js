const { Films, Actors } = require('../../model')

const ApiError = require('../apiError')
// const { UniqueConstraintError,  } = require('sequelize')

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
  return film
}

module.exports = { execute, validatorRules }
