import React, { Component, } from 'react'
import { Alert, Pagination, Button, Form as BForm, Col } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'

import debounce from 'lodash/debounce'

import DropZone from './Components/DropZone'
import DeleteButton from './Components/DeleteButton'

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

  handleError = error => {
    this.setState({error})
  }

  handlePage = async page => {
    await this.fetchFilms(`?page=${page}`)
  }

  render () {
    const error = this.state.error

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
          handleError={this.handleError}
          searchFilm={this.state.searchFilm}
          searchActor={this.state.searchActor}
        />
        <AddFilm
          handleForm={this.handleForm}
          handleSearch={this.handleSearch}
          handleError={this.handleError}
        />
        {error && <Alert variant="danger" onClose={() => this.setState({error: null})} dismissible>
          <Alert.Heading>Oh snap! You got an error!</Alert.Heading>
            <p>
              It seems to me that you are starting to test me. Not worth it.
              My author is a backend developer. Better go talk to the server.
              <hr />
              CODE: {error.code}. Message: {error.message}.
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
    try {
      const filmId = await handleApiResponse( fetch(`/api/film`, {
        method: 'POST',
        body: JSON.stringify(film),
        headers: { 'Content-Type': 'application/json' }
      }) )
      this.props.handleForm({id: filmId, ...film})
    } catch (error) {
      this.props.handleError(error)
    }
  }

  handleSearch = () => {
    this.props.handleSearch()
    this.setState({ didRenderForm: false })
  }

  render () {
    const handleError = this.props.handleError
    const didRenderForm = this.state.didRenderForm

    return (
      <>
        <Button
          variant='dark'
          onClick={() => this.setState(({didRenderForm}) => ({didRenderForm: !didRenderForm}))}
          block
        >Add film</Button>
        {didRenderForm && <Form handleSubmit={this.handleSubmit}/>}
        {didRenderForm &&
          <DropZone handleSearch={this.handleSearch} handleError={handleError}/>
        }
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
    try {
      await handleApiResponse(
        fetch(`/api/film?id=${id}`,{
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        })
      )
      this.props.handleDelete(id)
    } catch (error) {
      this.props.handleError(error)
    }
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
    return (
      <div className='allFilms'>
        {!this.props.films.length &&
          <Alert variant='light' style={{margin: '0.1em', marginBottom: '-1em', textAlign: 'center'}}>
            No movies found. Please add a new movie or change your search parameters.
          </Alert>
        }
        {this.props.films.map(film =>
          <FilmInfo
            key={film.id}
            handleError={this.handleError}
            handleDelete={this.handleDeleteFilm}
            {...film}
            searchFilm={this.props.searchFilm}
            searchActor={this.props.searchActor}
          />
        )}
        <Pagination className='justify-content-center blue'>
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
  state = {
    uncover: false
  }

  handleShow = () => {
    this.setState(({uncover}) => ({uncover: !uncover}))
  }

  handleConfirm = () => {
    this.setState(({didRenderConfirm}) => ({didRenderConfirm: !didRenderConfirm}))
  }

  render () {
    const actors = this.props.actors.map(actor => `${actor.name} ${actor.surname}`).join(', ')
    const uncover = this.state.uncover

    const [, filmNameFirstPart, filmNameSecondPart] = this.props.name.match(
      new RegExp(`^(${this.props.searchFilm})(.*)`, 'i')
    )


    return (
      <div className='filmInfo'>
        <div className='filmCaption'>
          <div id='filmName' onClick={this.handleShow}>
            <b>{filmNameFirstPart}</b>{filmNameSecondPart}
          </div>
          <DeleteButton id={this.props.id} handleDelete={this.props.handleDelete}/>
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
      <BForm>
        <BForm.Row>
          <Col>
            <BForm.Control
              className='bForm'
              placeholder="Film name"
              value={this.props.filmSearch}
              onChange={e => this.onInputChange(e, 'searchFilm')}
              autoComplete='off'
            />
          </Col>
          <Col>
            <BForm.Control
              className='bForm'
              placeholder="Actor name or surname"
              value={this.props.actorSearch}
              onChange={e => this.onInputChange(e, 'searchActor')}
              autoComplete='off'
            />
          </Col>
        </BForm.Row>
      </BForm>
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
