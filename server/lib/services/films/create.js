const { Films, Actors, sequelize } = require('../../model')

const ApiError = require('../ApiError')
const { UniqueConstraintError } = require('sequelize')

const validatorRules = {
  name: ['required', 'shortly_text'],
  releaseYear: ['required', { number_between: [1895, new Date().getFullYear()] }],
  format: ['required', 'string', { one_of: ['VHS', 'DVD', 'Blu-Ray'] }],
  actors: ['required', 'not_empty_list', {
    list_of_objects: [{
      name: ['required', 'shortly_text'],
      surname: ['required', 'shortly_text']
    }]
  }]
}

const execute = async ({ actors, ...filmInformation }) => {
  try {
    const { film, actorsIds } = await sequelize.transaction(async t => {
      const film = await Films.create(filmInformation, { transaction: t })

      const actorsIds = await Promise.all(
        actors.map(async ({ name, surname }) => {
          const [actor] = await Actors.findOrCreate({
            where: {
              name,
              surname
            },
            transaction: t
          })
          return actor.id
        })
      )

      await film.setActors(actorsIds, { transaction: t })

      return { film, actorsIds }
    })

    return { filmId: film.id, actorsIds }
  } catch (err) {
    if (err instanceof UniqueConstraintError) {
      console.log(err)
      throw new ApiError({ code: 'FILM_NOT_UNIQUE', message: 'Film already exist' })
    }
    throw err
  }
}

module.exports = { execute, validatorRules }
