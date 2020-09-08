import React, { Component } from 'react'
import './App.css'

import debounce from 'lodash/debounce'

class App extends Component {
  state = {
    films: [],
    id: null
  }

  onFilmsChange = list => {
    this.setState({films: list})
  }

  onOfferClick = id => {
    this.setState({id})
  }

  handleForm = film => {
    this.setState(({films}) => ({films: films.concat(film) }) )
  }

  render () {
    // console.log(this.state.films)
    return (
      <>
        <SearchFilm films={this.state.films} onFilmsChange={this.onFilmsChange} onOfferClick={this.onOfferClick} />
        {this.state.id && <FilmInfoRender id={this.state.id} />}
        <AllFilms />
        <AddFilm handleForm={this.handleForm} />

      </>
    )
  }
}

class AddFilm extends Component {
  state = {
    didRenderForm: false
  }

  handleSubmit = async film => {
    console.log(film)
    const filmId = await handleApiResponse( fetch(`/api/film`, {
      method: 'POST',
      body: JSON.stringify(film),
      headers: { 'Content-Type': 'application/json' }
    }) )

    this.props.handleForm({id: filmId, ...film})
  }

  render () {
    return (
      <>
        <button
          className='buttonAddForm'
          onClick={() => this.setState(({didRenderForm}) => ({didRenderForm: !didRenderForm}))}
        >Add film</button>
        <Form handleSubmit={this.handleSubmit}/>
      </>
    )
  }
}

class Form extends Component {
  state = {
    name: '',
    releaseYear: '',
    format: '',
    actors: ''
  }

  handleInputChange = e => {
    const value = e.target.value
    const name = e.target.name

    this.setState({
      [name]: value
    })
  }

  handleSubmitOnClick = () => {
    const actorsList = this.state.actors
      .split(', ')
      .map(actor => {
        const separatedActor = actor.split(' ')
        return { name: separatedActor[0], surname: separatedActor[1]}
      }
    )

    this.props.handleSubmit({
      name: this.state.name,
      releaseYear: this.state.releaseYear,
      format: this.state.format,
      actorsList
    })
  }

  render () {
    return (
      <form>
        <label>Film name</label>
        <input
          type="text" name="name"
          value={this.state.name}
          onChange={this.handleInputChange}
        />

        <label>Release year</label>
        <input
          type="text" name="releaseYear"
          value={this.state.releaseYear}
          onChange={this.handleInputChange}
        />

        <label>Format</label>
        <input
          type="text" name="format"
          value={this.state.format}
          onChange={this.handleInputChange}
        />

        <label>Actors (comma separated)</label>
        <input
          type="text" name="actors"
          value={this.state.actors}
          onChange={this.handleInputChange}
        />

        <input
          type="submit"
          value="Отправить"
          onClick={this.handleSubmitOnClick}/>
      </form>
    )
  }

}

class AllFilms extends Component {
  state = {
    didRenderFilms: false,
    films: []
  }

  componentDidMount () {
    this.fetchFilmsList()
  }

  fetchFilmsList = async () => {
    const films = await handleApiResponse( fetch(`/api/films`) )
    this.setState({films})
  }

  onClickShowFilms = () => {
    this.setState({didRenderFilms: true})
  }

  render () {
    const didRenderFilms = this.state.didRenderFilms
    return (
      <div>
        <button onClick={this.onClickShowFilms}>Show all films</button>
        {didRenderFilms && this.state.films.map(film => <FilmInfo key={film.id} {...film}/>)
        }
      </div>
    )
  }
}

class FilmInfoRender extends Component {
  state = {
    filmInfo: null
  }
  componentDidMount () {
    this.fetchFilmsOffer(this.props.id)
  }

  fetchFilmsOffer = async id => {
    const filmInfo = await handleApiResponse( fetch(`/api/film?id=${id}`) )
    this.setState({filmInfo})
  }

  render () {
    return (
      this.state.filmInfo && <FilmInfo {...this.state.filmInfo}/>
    )
  }
}

const FilmInfo = props => {
  console.log(props)
  const actors = props.actors.map(actor => `${actor.name} ${actor.surname}`).join(', ')
  return (
    <div className='filmInfo'>
      <p>{props.name}</p>
      <p>Actors: {actors}</p>
      <p>Release year: {props.releaseYear}</p>
      <p>Format: {props.format}</p>
    </div>
  )
}

class SearchFilm extends Component {
  state = {
    searchFilm: '',
    searchActor: '',
    filmsOffer: [],
    onFocus: null
  }

  onInputChange = (e, valueName) => {
    const filmSearchValue = e.target.value
    this.setState({[valueName]: filmSearchValue})
    if (filmSearchValue && filmSearchValue !== '') {
      return this.fetchFilmsOffer(filmSearchValue, valueName)
    }
    this.setState({filmsOffer: []})
    this.fetchFilmsOffer.cancel()
  }

  fetchFilmsOffer = debounce(async (filmSearchValue, valueName) => {
    console.log(filmSearchValue, valueName)
    const filmsOffer = await handleApiResponse( fetch(`/api/films?${valueName}=${filmSearchValue}`) )
    this.setState({filmsOffer})
  }, 600)

  onFocus = className => {
    this.setState({onFocus: className, filmsOffer: []})
  }


//need optimization
  render () {
    return (
      <>
        <div>
          <input
            onFocus={() => this.onFocus('filmName')}
            className='inputSearch'
            type='text'
            value={this.state.filmSearchValue}
            onChange={e => this.onInputChange(e, 'searchFilm')}
            autoComplete='off'
          />
          {this.state.filmsOffer[0]
            && this.state.onFocus === 'filmName'
            && <SearchOffer films={this.state.filmsOffer} onClick={this.props.onOfferClick} />
          }
        </div>
        <div>
          <input
            onFocus={() => this.onFocus('actorName')}
            className='inputSearch'
            type='text'
            value={this.state.actorSearchValue}
            onChange={e => this.onInputChange(e, 'searchActor')}
            autoComplete='off'
          />
          {this.state.filmsOffer[0]
            && this.state.onFocus === 'actorName'
            && <SearchOffer films={this.state.filmsOffer} onClick={this.props.onOfferClick} />
          }
        </div>

      </>
    )
  }
}

const SearchOffer = props => {
  // console.log(props)
  return (
    props.films.map(film =>
      <div
        key={film.id}
        className='filmOffer'
        onClick={() => props.onClick(film.id)}
      >{film.name}</div>
    )
  )
}

export const handleApiResponse = promise => {
  return promise
    .then(res => res.text())
    .then(JSON.parse)
    .then(body => {
      if (body.ok) {
        return body.data
      }
      throw body.error
    })
}

export default App
