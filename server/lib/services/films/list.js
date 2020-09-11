const { Films, Actors } = require('../../model')

const { Op } = require('sequelize')

const formatFilm = require('./format')

const validatorRules = {
  page: 'page_number',
  size: 'page_size',
  searchFilm: 'shortly_text',
  searchActor: 'shortly_text'
}

const execute = async filters => {
  const offset = filters.page * filters.size - filters.size
  const limit = filters.size

  const where = {
    ...await getFilterByActors(filters.searchActor),
    ...getFilterByFilms(filters.searchFilm)
  }

  const { rows: films, count } = await Films.findAndCountAll({
    where,
    distinct: true,
    include: [{
      model: Actors
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

const getFilterByActors = async search => {
  if (!search) {
    return {}
  }

  const allFilmsIds = (
    await Films.findAll({
      include: [{
        model: Actors,
        where: {
          [Op.or]: {
            name: { [Op.startsWith]: search },
            surname: { [Op.startsWith]: search }
          }
        }
      }]
    })
  ).map(film => film.id)

  return { id: allFilmsIds }
}

const getFilterByFilms = search => {
  if (!search) {
    return {}
  }
  return { name: { [Op.startsWith]: search } }
}

module.exports = { execute, validatorRules }
