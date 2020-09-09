const { Films } = require('../../model')

const ApiError = require('../ApiError')

const validatorRules = {
  id: ['required', 'integer']
}

const execute = async ({ id }) => {
  const quantity = await Films.destroy({
    where: {
      id
    }
  })

  if (!quantity) throw new ApiError({ code: 'FILM_NOT_FOUND', message: 'No movie found for this ID' }) // quantity = 0
}

module.exports = { execute, validatorRules }
