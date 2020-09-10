import React, { Component } from 'react'
import { Alert, Pagination, Button } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'

import debounce from 'lodash/debounce'

import DropZone from './Components/DropZone'

class App extends Component {
  state = {
    films: [],
    searchFilm: '',
    searchActor: '',
    pagination: {},
    error: null
  }

  async componentDidMount () {
    await this.fetchFilms()
  }

  fetchFilms = async (query = '') => {
    const {films, pagination } = await handleApiResponse( fetch('/api/films' + query) )
    this.setState({ films, pagination })
  }

  handleSearch = async (key, value) => {
    if (!value && value === '') {
      const { films, pagination } = await handleApiResponse( fetch('/api/films') )
      this.setState({films, pagination, [key]: value})
      return
    }
    const { films, pagination } = await handleApiResponse( fetch(`/api/films?${key}=${value}`) )
    this.setState({ films, pagination, [key]: value })
  }

  handleForm = film => {
    this.setState(({films}) => ({films: films.concat(film) }) )
  }

  handleDelete = id => {
    this.setState(({films}) => ({films: films.filter(film => film.id !== id)}))
  }

  handlePage = async page => {
    console.log('_____________________-')
    await this.fetchFilms(`?page=${page}`)
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
          pagination={this.state.pagination}
          handlePage={this.handlePage}
        />
        <AddFilm
          handleForm={this.handleForm}
          handleSearch={this.handleSearch}
        />
        {this.state.alert && <Alert variant="danger" >
          <Alert.Heading>Oh snap! You got an error!</Alert.Heading>
            <p>
              Change this and that and try again. Duis mollis, est non commodo
              luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit.
              Cras mattis consectetur purus sit amet fermentum.
            </p>
          </Alert>
        }
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
        <Button
          variant='dark'
          onClick={() => this.setState(({didRenderForm}) => ({didRenderForm: !didRenderForm}))}
          block
        >Add film</Button>
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

        <Button
          type="submit"
          variant='dark'
          onClick={this.handleSubmitOnClick}
          block
        >Send</Button>
      </form>
    )
  }

}

class AllFilms extends Component {
  state = {
    pageNumbers: [],
    activePage: 1
  }

  handleDeleteFilm = async id => {
    const res = await handleApiResponse(
      fetch(`/api/film?id=${id}`,{
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })
    )
    this.props.handleDelete(id)
  }

  componentDidUpdate (prevProps) {
    if (prevProps !== this.props) {
      const stupidArr = []
      for (let i = 1; i <= this.props.pagination.pages; i++) { // такой херни я еще не писал
        stupidArr.push(i)
      }
      this.setState({pageNumbers: stupidArr})
    }

  }

  changeActivePage = page => {
    this.props.handlePage(page)
    this.setState({activePage: page})
  }

  render () {
    console.log(this.props)
    return (
      <div className='allFilms'>
        {this.props.films.map(film =>
          <FilmInfo key={film.id} handleDelete={this.handleDeleteFilm} {...film}/>
        )}
        <Pagination className='justify-content-center'>
          {this.state.pageNumbers.map(pNum =>
            <Pagination.Item
              variant='secondary'
              active={pNum === this.state.activePage}
              key={pNum}
              onClick={() => this.changeActivePage(pNum)}
              style={{'color': 'white'}}
            >{pNum}</Pagination.Item>)
          }
        </Pagination>
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
