const { Films, Actors } = require('../../model')


// const ApiError = require('../apiError')
// const { UniqueConstraintError,  } = require('sequelize')


const validatorRules = {
  actorName: [ 'required', 'string', { max_length: 90 } ]
}

const execute = async ({ actorName }) => {
  try {

    const films = Films.findAll({
      include: [
        {
          model: Actors,
          where: {
            name: actorName
          }
        }
      ]
    })

    return films

  } catch (err) {
    // if (err instanceof UniqueConstraintError) {
    //   throw new ApiError({code: 'FILM_NOT_UNIQUE', message: 'Film already exist'})
    // }
    throw err
  }

}

module.exports = {execute, validatorRules}
