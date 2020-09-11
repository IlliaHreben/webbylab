const fetch = require('node-fetch')
const { sequelize } = require('../../lib/model')
const { app: { port } } = require('../../config')

const requestBody = {
  name: 'Young Frankenstein',
  releaseYear: 1974,
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

test('Film added', async () => {
  const body = await createFilm(requestBody)

  expect(body).toEqual({
    ok: true,
    data: {
      actorsIds: expect.any(Array),
      filmId: expect.any(Number)
    }
  })
  expect(body.data.actorsIds).toHaveLength(requestBody.actors.length)
})

test('Film not unique', async () => {
  const body = await createFilm(requestBody)

  expect(body).toEqual({
    ok: false,
    error: {
      code: 'FILM_NOT_UNIQUE',
      message: 'Film already exist'
    }
  })
})

test('Film create, but with different release year and same name', async () => {
  const body = await createFilm({ ...requestBody, releaseYear: requestBody.releaseYear + 1 })

  expect(body).toEqual({
    ok: true,
    data: {
      actorsIds: expect.any(Array),
      filmId: expect.any(Number)
    }
  })
})

test('Film create, but with same release year and different name', async () => {
  const body = await createFilm({ ...requestBody, name: requestBody.name + 'string' })

  expect(body).toEqual({
    ok: true,
    data: {
      actorsIds: expect.any(Array),
      filmId: expect.any(Number)
    }
  })
})

describe.each([
  { ...requestBody, name: '' },
  { ...requestBody, releaseYear: null },
  { ...requestBody, format: '' },
  { ...requestBody, actors: [] },
  {
    ...requestBody,
    actors: [
      { name: '', surname: 'Wilder' },
      { name: 'Kenneth', surname: '' }
    ]
  }
])('should be invalid format', input => {
  test('returns INVALID_FORMAT', async () => {
    expect(await createFilm(input)).toEqual({
      ok: false,
      error: {
        code: 'FORMAT_ERROR',
        message: 'Invalid format'
      }
    })
  })
})

const createFilm = async requestBody => {
  const result = await fetch(`http://localhost:${port}/api/film`, {
    method: 'POST',
    body: JSON.stringify(requestBody),
    headers: { 'Content-Type': 'application/json' }
  })
  const body = await result.json()
  return body
}
