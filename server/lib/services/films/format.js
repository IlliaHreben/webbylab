const formatFilm = film => {
  return {
    id: film.id,
    name: film.name,
    releaseYear: film.releaseYear,
    format: film.format,
    actors: film.actors.map(actor => ({
      id: actor.id,
      name: actor.name,
      surname: actor.surname
    }))
  }
}

module.exports = formatFilm
