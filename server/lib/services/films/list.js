const { Films, Actors } = require('../../model')

const { Op } = require('sequelize')

const formatFilm = require('./format')

const validatorRules = {
  searchFilm: ['not_empty', 'shortly_text'],
  searchActor: ['not_empty', 'shortly_text']
}

const execute = async filters => {
  const filmsWhere = filters.searchFilm ? { name: { [Op.startsWith]: filters.searchFilm } } : {}
  const actorsWhere = filters.searchActor ? {
    [Op.or]: {
      name: { [Op.startsWith]: filters.searchActor },
      surname: { [Op.startsWith]: filters.searchActor }
    }
  } : {}

  const { rows: films, count } = await Films.findAndCountAll({
    where: filmsWhere,
    distinct: true,
    include: [{
      model: Actors,
      where: actorsWhere
    }],
    order: [['name', 'ASC'], [Actors, 'name', 'ASC'], [Actors, 'surname', 'ASC']],
    offset: 0,
    limit: 100
  })
  console.log('Count:', count, films.length)
  return films.map(formatFilm)
}

module.exports = { execute, validatorRules }
