const fs = require('fs')
const fetch = require('node-fetch')
const path = require('path')
const { sequelize } = require('../../lib/model')
const { app: { port } } = require('../../config')

beforeAll(() => sequelize.sync({ force: true }))

afterAll(() => sequelize.close())

test('file could be correctly uploaded', async () => {
  const file = await fs.readFileSync(path.resolve(__dirname, 'sample_movies.txt'), 'utf8')

  const fileLength = file.split('\n\n').length

  const response = await fetch(`http://localhost:${port}/api/importFilms`, {
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

  expect(body.data).toHaveLength(fileLength)
})
