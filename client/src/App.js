import React, { Component } from 'react'
import './App.css'

import debounce from 'lodash/debounce'

import DropZone from './Components/DropZone'

class App extends Component {
  state = {
    films: [],
    searchFilm: '',
    searchActor: ''
  }

  async componentDidMount () {
    const films = await handleApiResponse( fetch('/api/films') )
    this.setState({films})
  }

  handleSearch = async (key, value) => {
    if (!value && value === '') {
      const films = await handleApiResponse( fetch('/api/films') )
      this.setState({films, [key]: value})
      return
    }
    const films = await handleApiResponse( fetch(`/api/films?${key}=${value}`) )
    this.setState({films, [key]: value})
  }

  handleForm = film => {
    this.setState(({films}) => ({films: films.concat(film) }) )
  }

  handleDelete = id => {
    this.setState(({films}) => ({films: films.filter(film => film.id !== id)}))
  }

  render () {
    return (
      <>
        <SearchFilm
          films={this.state.films}
          handleSearch={this.handleSearch}
          searchFilm={this.searchFilm}
          searchActor={this.searchActor}
        />
        <AllFilms
          films={this.state.films}
          handleDelete={this.handleDelete}
        />
        <AddFilm
          handleForm={this.handleForm}
          handleSearch={this.handleSearch}
        />

      </>
    )
  }
}

class AddFilm extends Component {
  state = {
    didRenderForm: false
  }

  handleSubmit = async film => {
    const filmId = await handleApiResponse( fetch(`/api/film`, {
      method: 'POST',
      body: JSON.stringify(film),
      headers: { 'Content-Type': 'application/json' }
    }) )

    this.props.handleForm({id: filmId, ...film})
  }

  handleSearch = () => {
    this.props.handleSearch()
    this.setState({ didRenderForm: false })
  }

  render () {
    return (
      <>
        <button
          className='buttonAddForm'
          onClick={() => this.setState(({didRenderForm}) => ({didRenderForm: !didRenderForm}))}
        >Add film</button>
        {this.state.didRenderForm && <Form handleSubmit={this.handleSubmit}/>}
        {this.state.didRenderForm && <DropZone handleSearch={this.handleSearch}/>}
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
    const actors = this.state.actors
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
      actors
    })
  }

  render () {
    return (
      <form className='addFilm'>
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
          value="Send"
          onClick={this.handleSubmitOnClick}/>
      </form>
    )
  }

}

class AllFilms extends Component {

  handleDeleteFilm = async id => {
    const res = await handleApiResponse(
      fetch(`/api/film?id=${id}`,{
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })
    )
    this.props.handleDelete(id)
  }

  render () {
    return (
      <div className='allFilms'>
        {this.props.films.map(film =>
          <FilmInfo key={film.id} handleDelete={this.handleDeleteFilm} {...film}/>
        )}
      </div>
    )
  }
}

class FilmInfo extends Component {
  state = { uncover: false, didRenderConfirm: false }

  handleShow = () => {
    this.setState(({uncover}) => ({uncover: !uncover}))
  }

  handleConfirm = () => {
    this.setState(({didRenderConfirm}) => ({didRenderConfirm: !didRenderConfirm}))
  }

  render () {
    const actors = this.props.actors.map(actor => `${actor.name} ${actor.surname}`).join(', ')
    const uncover = this.state.uncover
    return (
      <div className='filmInfo'>
        <div className='filmCaption'>
          <div id='filmName' onClick={this.handleShow}>{this.props.name}</div>
          {
            !this.state.didRenderConfirm && <div
              id='delete'
              onClick={this.handleConfirm}
            >delete</div>
          }
          {
            this.state.didRenderConfirm && <div
              id='delete'
              onClick={() => this.props.handleDelete(this.props.id)}
            >Sure?</div>
          }
        </div>
        <div className='detailedInfo'>
          {uncover && <p className='actors'>Actors: {actors}</p>}
          {uncover && <p className='releaseYear'>Release year: {this.props.releaseYear}</p>}
          {uncover && <p className='format'>Format: {this.props.format}</p>}
        </div>
      </div>
    )
  }
}

class SearchFilm extends Component {
  onInputChange = (e, key) => {
    const value = e.target.value
    return this.fetchFilms(value, key)
  }

  fetchFilms = debounce(async (value, key) => {
    this.props.handleSearch(key, value)
  }, 600)

//need optimization
  render () {
    return (
      <div className='header'>
        <input
          className='inputSearch'
          type='text'
          value={this.props.filmSearch}
          onChange={e => this.onInputChange(e, 'searchFilm')}
          autoComplete='off'
        />
        <input
          className='inputSearch'
          type='text'
          value={this.props.actorSearch}
          onChange={e => this.onInputChange(e, 'searchActor')}
          autoComplete='off'
        />
      </div>
    )
  }
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
