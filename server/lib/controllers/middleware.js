const ApiError = require('../services/apiError')

const handleError = async (_, res, next) => {
  try {
    // console.log("--------------------------------")
    await next()

  } catch (err) {
    console.log("--------------------------------")
    if (err instanceof ApiError) {
      console.warn(err)
      res
        .status = 400
        .send = {
          ok: false,
          error: {
            code: err.code,
            message: err.message
          }
        }
    } else {
      console.error(err)
      // console.log('-------------------------------------')
      res
        .status = 500
        .send = {
          ok: false,
          error: {
            code: 'UNKNOWN_ERROR',
            message: 'Unknown error'
          }
        }
    }

  }
}

module.exports = {handleError}
