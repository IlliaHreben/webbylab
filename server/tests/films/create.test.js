const fetch = require('node-fetch')
const { sequelize } = require('../../lib/model')

const requestBody = {
  name: 'Young Frankenstein',
  releaseYear: '1974',
  format: 'VHS',
  actorsList: [
    { name: 'Gene', surname: 'Wilder' },
    { name: 'Kenneth', surname: 'Mars' },
    { name: 'Terri', surname: 'Garr' },
    { name: 'Gene', surname: 'Hackman' },
    { name: 'Peter', surname: 'Boyle' }
  ]
}

beforeAll(() => sequelize.sync( {force: true} ))

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
  expect(body.data.actorsIds).toHaveLength(requestBody.actorsList.length)
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

const createFilm = async requestBody => {
  const result = await fetch('http://localhost:4000/api/film', {
    method: 'POST',
    body: JSON.stringify(requestBody),
    headers: { 'Content-Type': 'application/json'}
  })
  const body = await result.json()
  return body
}
