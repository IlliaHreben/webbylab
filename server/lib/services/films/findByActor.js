const { Films, Actors } = require('../../model')


// const ApiError = require('../apiError')
// const { UniqueConstraintError,  } = require('sequelize')


const validatorRules = {
  actorName: [ 'required', 'string', { max_length: 90 } ]
}

const execute = async ({ actorName }) => {

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
}

module.exports = {execute, validatorRules}
