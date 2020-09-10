const fetch = require('node-fetch')
const { sequelize } = require('../../lib/model')

const requestBody = {
  name: 'Young Frankenstein3',
  releaseYear: '1974',
  format: 'VHS',
  actors: [
    { name: 'Gene', surname: 'Wilder' },
    { name: 'Kenneth', surname: 'Mars' },
    { name: 'Terri', surname: 'Garr' },
    { name: 'Gene', surname: 'Hackman' },
    { name: 'Peter', surname: 'Boyle' }
  ]
}

beforeAll(() => sequelize.sync({ force: true }))

afterAll(() => sequelize.close())

test('Film delete', async () => {
  const bodyFilm = await createFilm(requestBody)

  expect(bodyFilm).toEqual({
    ok: true,
    data: {
      actorsIds: expect.any(Array),
      filmId: expect.any(Number)
    }
  })

  const filmId = await deleteFilm('?id=1')
  expect(filmId).toEqual({ ok: true })
})

test('Film not found', async () => {
  const error = await deleteFilm('?id=1')
  expect(error).toEqual({
    ok: false,
    error: {
      code: 'FILM_NOT_FOUND',
      message: 'No movie found for this ID'
    }
  })
})

test('Invalid ID format', async () => {
  const error = await deleteFilm('?id=string')
  expect(error).toEqual({
    ok: false,
    error: {
      code: 'FORMAT_ERROR',
      message: 'Invalid format'
    }
  })
})

const createFilm = async (requestBody) => {
  const result = await fetch('http://localhost:4000/api/film', {
    method: 'POST',
    body: JSON.stringify(requestBody),
    headers: { 'Content-Type': 'application/json' }
  })
  const body = await result.json()
  return body
}

const deleteFilm = async query => {
  const result = await fetch('http://localhost:4000/api/film' + query, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' }
  })
  const body = await result.json()
  return body
}
