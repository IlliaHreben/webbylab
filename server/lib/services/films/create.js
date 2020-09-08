const { Films, Actors, sequelize } = require('../../model')

const ApiError = require('../apiError')
const { UniqueConstraintError,  } = require('sequelize')


const validatorRules = {
  name: [ 'required', 'string', { max_length: 90 } ],
  releaseYear: ['required', { 'number_between': [1895, new Date().getFullYear()] }],
  format: [ 'required', 'string', {'one_of': ['VHS', 'DVD', 'Blu-Ray']} ],
  actorsList: [ 'required' , {
    'list_of_objects': [{
      name: ['required', 'string', { max_length: 90 } ],
      surname: ['required', 'string', { max_length: 90 } ]
    }]
  }]
}

const execute = async ({actorsList, ...filmInformation}) => {
  try {

    const {film, actorsIds} = await sequelize.transaction(async t => {

      const film = await Films.create(filmInformation, {transaction: t})

      const actors = await Actors.bulkCreate(actorsList, {
        updateOnDuplicate: ['name', 'surname'],
        transaction: t
      })
      const actorsIds = actors.map(actor => actor.id)

      await film.setActors( actorsIds, {transaction: t} )

      return {film, actorsIds}
    })

    return {filmId: film.id, actorsIds}

  } catch (err) {
    if (err instanceof UniqueConstraintError) {
      throw new ApiError({code: 'FILM_NOT_UNIQUE', message: 'Film already exist'})
    }
    throw err
  }

}
// validatorRules
module.exports = {execute, validatorRules}
