const { Films, Actors, sequelize } = require('../../model')

const ApiError = require('../apiError')
const { UniqueConstraintError,  } = require('sequelize')


// const ApiError = require('../apiError')
// const { UniqueConstraintError } = require('sequelize')

// const validatorRules = {
//   email: ['required', 'trim', 'email', 'to_lc'],
//   name: [ 'required', 'string', { min_length: 2 } ],
//   surname: [ 'required', 'string', { min_length: 2 } ]
// }

const execute = async ({name, releaseDate, format, actorsList}) => {
  try {

    const {film, actorsIds} = await sequelize.transaction(async t => {

      const film = await Films.create({
        name,
        releaseDate,
        format
      }, {transaction: t})

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
module.exports = {execute, }
