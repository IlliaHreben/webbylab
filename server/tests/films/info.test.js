const fetch = require('node-fetch')
const { sequelize } = require('../../lib/model')

const requestBody = {
  name: 'Young Frankenstein10',
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

test('Film information about', async () => {
  const bodyFilm = await createFilm(requestBody)

  expect(bodyFilm).toEqual({
    ok: true,
    data: {
      actorsIds: expect.any(Array),
      filmId: expect.any(Number)
    }
  })

  const response = await getFilm(bodyFilm.data.filmId)
  expect(response).toEqual({
    ok: true,
    data: {
      name: requestBody.name,
      releaseYear: requestBody.releaseYear,
      format: requestBody.format,
      actors: requestBody.actors.map((actor, i) => ({ id: bodyFilm.data.actorsIds[i], ...actor })),
      id: bodyFilm.data.filmId
    }
  })
})

const createFilm = async requestBody => {
  const result = await fetch('http://localhost:4000/api/film', {
    method: 'POST',
    body: JSON.stringify(requestBody),
    headers: { 'Content-Type': 'application/json' }
  })
  const body = await result.json()
  return body
}

const getFilm = async id => {
  const result = await fetch(`http://localhost:4000/api/film?id=${id}`)
  const body = await result.json()
  return body
}
