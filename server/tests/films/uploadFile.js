const fs = require('fs')
const fetch = require('node-fetch')
const path = require('path')
const { sequelize } = require('../../lib/model')

beforeAll(() => sequelize.sync({ force: true }))

afterAll(() => sequelize.close())

test('file could be correctly uploaded', async () => {
  const file = await fs.readFileSync(path.resolve(__dirname, 'sample_movies.txt'))

  const response = await fetch('http://localhost:4000/api/importFilms', {
    method: 'POST',
    body: file
  })

  const body = await response.json()
  expect(body).toEqual({
    ok: true,
    data: expect.any(Array)
  })

  body.data.forEach(result => {
    expect(result).toEqual({
      ok: true,
      film: {
        filmId: expect.any(Number),
        actorsIds: expect.any(Array)
      }
    })
  })
})
