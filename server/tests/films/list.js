const fetch = require('node-fetch')
const { sequelize } = require('../../lib/model')

const requestBody = {
  name: 'Young Frankenstein',
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

// test('Film added', async () => {
//   const body = await createFilm(requestBody)
//
//   expect(body).toEqual({
//     ok: true,
//     data: {
//       actorsIds: expect.any(Array),
//       filmId: expect.any(Number)
//     }
//   })
//   expect(body.data.actorsIds).toHaveLength(requestBody.actors.length)
// })

const getFilm = async (query = '') => {
  const result = await fetch(`http://localhost:4000/api/films${query}`)
  const body = await result.json()
  return body
}
