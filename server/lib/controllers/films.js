const runService = require('../services/runService')
const createFilm = runService(require('../services/films/create'))
const deleteFilm = runService(require('../services/films/delete'))
const getInfoFilm = runService(require('../services/films/info'))
const listFilms = runService(require('../services/films/list'))

const ApiError = require('../services/ApiError')

const create = async (req, res) => {

  const film = await createFilm(req.body)
  res.send({
    ok: true,
    data: film
  })
}

const remove = async (req, res) => {

  await deleteFilm(req.query)
  res.send({
    ok: true
  })

}

const info = async (req, res) => {

  const film = await getInfoFilm(req.query)
  res.send({
    ok: true,
    data: film
  })

}

const getAll = async (_, res) => {

  const films = await getFilms()
  res.send({
    ok: true,
    data: films
  })

}

const findFilms = async (req, res) => {

  const films = await listFilms(req.query)
  res.send({
    ok: true,
    data: films
  })

}

const importFilms = async (req, res) => {
  const results = []
  let acc = ''
  req.setEncoding('utf8')
  req.on('data', async chunk => {
    acc += chunk
    req.pause()
    while (hasCompitedParts(acc)) {
      const { firstChunkPart, rest } = splitFirstChunkPart(acc)
      acc = rest
      if (!firstChunkPart) continue
      results.push( await processChunk(firstChunkPart) )
    }
    req.resume()

  })


  req.on('end', async () => {
    const promise = await processChunk(acc)
    res.send({ok: true, results})
  })
}

const processChunk = async complitedChunk => {
  try {
    const film = await createFilm(parsedPartToFilm(parseComplitedPart(complitedChunk)))
    return {ok: true, film}
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, error: {message: error.message, code: error.code} }
    }
    console.error(error)
    return { ok: false, error: {message: 'Unknown error', code: 'UNKNOWN_ERROR'} }
  }

}

const splitFirstChunkPart = chunk => {
  const index = chunk.indexOf('\n\n')
  const firstChunkPart = chunk.substring(0, index)
  const rest = chunk.substring(index + 2)

  return { firstChunkPart, rest }
}

const hasCompitedParts = acc => {
  return acc.includes('\n\n')
}

const parseComplitedPart = part => {
  const partStrings = part.split('\n')
  return partStrings
    .map(string => {
      const matches = string.match(/(^[^:]+):(.*)$/)
      if (!matches) {
        return {}
      }
      const [, key, value] = matches
      return {[key.trim()]: value.trim()}
    })
    .reduce((acc, value) => ({...acc, ...value}), {})
}

const parsedPartToFilm = parsedPart => {
  return {
    name: parsedPart.Title,
    releaseYear: parsedPart['Release Year'],
    format: parsedPart.Format,
    actorsList: (parsedPart.Stars || '')
      .split(/,\s*/)
      .map(actor => {
        const [name, surname] = actor.split(' ')
        return { name, surname }
      })
  }
}

module.exports = {create, remove, info, getAll, findFilms, importFilms}
