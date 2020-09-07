const { Films, Actors } = require('../../model')


// const ApiError = require('../apiError')
// const { UniqueConstraintError,  } = require('sequelize')

const execute = async () => {
  try {

    const films = Films.findAll({
      include: [{ model: Actors }],
      order: [ [ 'name', 'ASC' ] ],
      limit: 10
    })

    return films

  } catch (err) {
    // if (err instanceof UniqueConstraintError) {
    //   throw new ApiError({code: 'FILM_NOT_UNIQUE', message: 'Film already exist'})
    // }
    throw err
  }

}

module.exports = execute
