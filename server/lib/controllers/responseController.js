const ApiError = require('../ApiError')

const sendPromiseToClient = (res, promise) => {
  promise
    .then(data => {
      console.log(data)
      res.send({
        ok: true,
        data
      })
    })
    .catch(err => {
      if (err instanceof ApiError) {
        console.warn(err.message)
        res
          .status(400)
          .send({
            ok: false,
            error: {message: err.message, code: err.code}
          })
      } else {
        console.error(err)
        res
          .status(500)
          .send({
            ok: false,
            error: {message: 'Unknown error', code: 'UNKNOWN_ERROR'}
          })
      }
    })
}

module.exports = sendPromiseToClient
