const { Films, Actors } = require('../../model')

const { Op } = require('sequelize')

const formatFilm = require('./format')

const validatorRules = {
  searchFilm: ['not_empty', 'string', { max_length: 90 }],
  searchActor: ['not_empty', 'string', { max_length: 90 }]
}

const execute = async filters => {
  const filmsWhere = filters.searchFilm ? { name: { [Op.startsWith]: filters.searchFilm } } : {}
  const actorsWhere = filters.searchActor ? {
    [Op.or]: {
      name: { [Op.startsWith]: filters.searchActor },
      surname: { [Op.startsWith]: filters.searchActor }
    }
  } : {}

  const films = await Films.findAll({
    where: filmsWhere,
    include: [{
      model: Actors,
      where: actorsWhere
      // required: false
    }],
    order: [['name', 'ASC']],
    limit: 10
  })

  return films.map(formatFilm)
}

module.exports = { execute, validatorRules }
