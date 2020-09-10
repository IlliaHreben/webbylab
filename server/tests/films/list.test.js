const fetch = require('node-fetch')
const { sequelize } = require('../../lib/model')

beforeAll(() => sequelize.sync({ force: true }))

const responsedFilmIds = []
beforeAll(async () => {
  for (const film of films) {
    const responsedFilmId = await createFilm(film)
    responsedFilmIds.push(responsedFilmId)
  }
})

afterAll(() => sequelize.close())

test('Film cheking', async () => {
  const responsedFilms = await getFilms()

  expect(responsedFilms).toEqual({
    ok: true,
    data: films.map(film => ({
      id: expect.any(Number),
      ...film,
      actors: film.actors.map(actor => ({
        id: expect.any(Number),
        ...actor
      }))
    }))
  })
})

test('Film cheking with film name filter', async () => {
  const responsedFilms = await getFilms('?searchFilm=Butch Cassidy and the Sundance Kid')

  expect(responsedFilms).toEqual({
    ok: true,
    data: [
      {
        id: expect.any(Number),
        ...films[0],
        actors: films[0].actors.map(actor => ({
          id: expect.any(Number),
          ...actor
        }))

      }
    ]
  })
})

test('Film cheking with actor name filter', async () => {
  const responsedFilms = await getFilms('?searchActor=George')

  expect(responsedFilms).toEqual({
    ok: true,
    data: [
      {
        id: expect.any(Number),
        ...films[2],
        actors: [{
          id: expect.any(Number),
          name: 'George',
          surname: 'Kennedy'
        }]

      }, {
        id: expect.any(Number),
        ...films[3],
        actors: [{
          id: expect.any(Number),
          name: 'George',
          surname: 'Kennedy'
        }]

      }
    ]
  })
})

test('Film not find', async () => {
  const responsedFilms = await getFilms('?searchFilm=string')

  expect(responsedFilms).toEqual({
    ok: true,
    data: []
  })
})

const getFilms = async (query = '') => {
  const result = await fetch(`http://localhost:4000/api/films${query}`)
  const body = await result.json()
  return body
}

const createFilm = async requestBody => {
  const result = await fetch('http://localhost:4000/api/film', {
    method: 'POST',
    body: JSON.stringify(requestBody),
    headers: { 'Content-Type': 'application/json' }
  })
  const body = await result.json()
  if (!body.ok) throw new Error(body.error.message)
  return body
}

const films = [
  {
    name: 'Butch Cassidy and the Sundance Kid',
    releaseYear: 1969,
    format: 'VHS',
    actors: [
      { name: 'Katherine', surname: 'Ross' },
      { name: 'Paul', surname: 'Newman' },
      { name: 'Robert', surname: 'Redford' }
    ]
  },
  {
    name: 'Casablanca',
    releaseYear: 1942,
    format: 'DVD',
    actors: [
      { name: 'Claude', surname: 'Rains' },
      { name: 'Humphrey', surname: 'Bogart' },
      { name: 'Ingrid', surname: 'Bergman' },
      { name: 'Peter', surname: 'Lorre' }
    ]
  },
  {
    name: 'Charade',
    releaseYear: 1953,
    format: 'DVD',
    actors: [
      { name: 'Audrey', surname: 'Hepburn' },
      { name: 'Cary', surname: 'Grant' },
      { name: 'George', surname: 'Kennedy' },
      { name: 'James', surname: 'Coburn' },
      { name: 'Walter', surname: 'Matthau' }
    ]
  },
  {
    name: 'Cool Hand Luke',
    releaseYear: 1967,
    format: 'VHS',
    actors: [
      { name: 'George', surname: 'Kennedy' },
      { name: 'Paul', surname: 'Newman' },
      { name: 'Strother', surname: 'Martin' }
    ]
  },
  {
    name: 'Get Shorty',
    releaseYear: 1995,
    format: 'DVD',
    actors: [
      { name: 'Danny', surname: 'DeVito' },
      { name: 'Dennis', surname: 'Farina' },
      { name: 'Gene', surname: 'Hackman' },
      { name: 'John', surname: 'Travolta' },
      { name: 'Renne', surname: 'Russo' }
    ]
  },
  {
    name: 'Gladiator',
    releaseYear: 2000,
    format: 'Blu-Ray',
    actors: [
      { name: 'Connie', surname: 'Nielson' },
      { name: 'Joaquin', surname: 'Phoenix' },
      { name: 'Russell', surname: 'Crowe' }
    ]
  }
]
