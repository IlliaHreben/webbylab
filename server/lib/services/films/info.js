const { Films, Actors } = require('../../model')

// const ApiError = require('../apiError')
// const { UniqueConstraintError,  } = require('sequelize')


const validatorRules = {
  id: [ 'required', 'integer' ]
}

const execute = async ({id}) => {
  try {

    const film = Films.findByPk(id, {
      include: [{ model: Actors }]
    })

    return film

  } catch (err) {
    // if (err instanceof UniqueConstraintError) {
    //   throw new ApiError({code: 'FILM_NOT_UNIQUE', message: 'Film already exist'})
    // }
    throw err
  }

}

module.exports = {execute, validatorRules}
