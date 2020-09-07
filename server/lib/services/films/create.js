const { Films, Actors } = require('../../model')

// const ApiError = require('../apiError')
// const { UniqueConstraintError } = require('sequelize')

// const validatorRules = {
//   email: ['required', 'trim', 'email', 'to_lc'],
//   name: [ 'required', 'string', { min_length: 2 } ],
//   surname: [ 'required', 'string', { min_length: 2 } ]
// }

const execute = async ({name, releaseDate, format, actorsList}) => {
  try {
    const user = await Films.create({
      name,
      releaseDate,
      format
    })

    return {id: user.id}
  } catch (err) {
    throw err
  //   if (err instanceof UniqueConstraintError) {
  //     throw new ApiError({code: 'EMAIL_NOT_UNIQUE', message: 'User already exist'})
  //   }
  //   throw err
  }

}
// validatorRules
module.exports = {execute, }
