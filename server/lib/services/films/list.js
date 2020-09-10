const { Films, Actors } = require('../../model')

const { Op } = require('sequelize')

const formatFilm = require('./format')

const validatorRules = {
  page: 'page_number',
  size: 'page_size',
  searchFilm: ['not_empty', 'shortly_text'],
  searchActor: ['not_empty', 'shortly_text']
}

const execute = async filters => {
  const offset = filters.page * filters.size - filters.size
  const limit = filters.size
  console.log(offset, limit)

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
    offset,
    limit,
    order: [['name', 'ASC'], [Actors, 'name', 'ASC'], [Actors, 'surname', 'ASC']]
  })

  return {
    films: films.map(formatFilm),
    pagination: { size: filters.size, pages: Math.ceil(count / filters.size) }
  }
}

module.exports = { execute, validatorRules }
