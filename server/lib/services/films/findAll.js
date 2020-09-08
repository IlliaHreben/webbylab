const { Films, Actors } = require('../../model')


// const ApiError = require('../apiError')
// const { UniqueConstraintError,  } = require('sequelize')

const execute = async () => {

  const films = Films.findAll({
    include: [{ model: Actors }],
    order: [ [ 'name', 'ASC' ] ],
    limit: 10
  })

  return films
}

module.exports = execute
