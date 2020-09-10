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

describe('Checking information about film', () => {
  test('True info', async () => {
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

  test('Checking id not number', async () => {
    const response = await getFilm('string')
    expect(response).toEqual({
      ok: false,
      error: {
        code: 'FORMAT_ERROR',
        message: 'Invalid format'
      }
    })
  })

  test('Checking wrong id', async () => {
    const response = await getFilm(999)
    expect(response).toEqual({
      ok: false,
      error: {
        code: 'FILM_NOT_FOUND',
        message: 'Film not found'
      }
    })
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
