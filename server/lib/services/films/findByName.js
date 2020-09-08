const { Films, Actors } = require('../../model')

const { Op } = require('sequelize')

const ApiError = require('../apiError')
// const { UniqueConstraintError,  } = require('sequelize')


const validatorRules = {
  filmName: [ 'required', 'string', { max_length: 90 } ]
}

const execute = async ({ filmName }) => {
  const films = await Films.findAll({
    where: {
      name: { [Op.startsWith]: filmName }
    },
    include: [{ model: Actors }]
  })

  return films
}

module.exports = {execute, validatorRules}
