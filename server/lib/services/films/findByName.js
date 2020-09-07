const { Films, Actors } = require('../../model')

const { Op } = require('sequelize')

// const ApiError = require('../apiError')
// const { UniqueConstraintError,  } = require('sequelize')


const validatorRules = {
  filmName: [ 'required', 'string', { max_length: 90 } ]
}

const execute = async ({ filmName }) => {
  try {

    const film = Films.findOne({
      where: {
        name: { [Op.startsWith]: filmName }
      },
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
