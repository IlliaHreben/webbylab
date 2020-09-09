const ApiError = require('../services/ApiError')

const handleError = async (err, _, res, __) => {
  if (err instanceof ApiError) {
    console.warn(err)

    res
      .status(400)
      .send({
        ok: false,
        error: {
          code: err.code,
          message: err.message
        }
      })
  } else {
    console.error(err)
    res
      .status(500)
      .send({
        ok: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: 'Unknown error'
        }
      })
  }
}

module.exports = { handleError }
