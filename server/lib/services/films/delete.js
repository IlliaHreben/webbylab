const { Films, Actors, sequelize } = require('../../model')

// const ApiError = require('../apiError')
// const { UniqueConstraintError,  } = require('sequelize')


const validatorRules = {
  id: [ 'required', 'integer' ]
}

const execute = async ({id}) => {
  try {

    Films.destroy({
    where: {
        id
      }
    })


  } catch (err) {
    // if (err instanceof UniqueConstraintError) {
    //   throw new ApiError({code: 'FILM_NOT_UNIQUE', message: 'Film already exist'})
    // }
    throw err
  }

}
// validatorRules
module.exports = {execute, validatorRules}
