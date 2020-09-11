import React, { Component, Fragment } from 'react'
import { Alert, Pagination, Button, Form as BForm, Col } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'

import debounce from 'lodash/debounce'

import DropZone from './Components/DropZone'
import DeleteButton from './Components/DeleteButton'
import ModalPortal from './Components/Modal'

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

  fetchFilms = async () => {
    const {pagination, searchFilm, searchActor} = this.state
    const searchParams = new URLSearchParams()
    if (pagination.page) searchParams.set('page', pagination.page)
    if (searchFilm) searchParams.set('searchFilm', searchFilm)
    if (searchActor) searchParams.set('searchActor', searchActor)

    const body = await handleApiResponse( fetch('/api/films?' + searchParams.toString()) )
    this.setState(body)
  }

  handleSearch = query => {
    this.setState(({
      pagination: {},
      ...query
    }), this.debouncedFetch)
  }

  debouncedFetch = debounce( this.fetchFilms, 600)

  handleDelete = id => {
    this.setState(({films}) => ({films: films.filter(film => film.id !== id)}))
  }

  handleError = error => {
    this.setState({error})
  }

  handlePage = page => {
    this.setState(
      ({pagination}) => ({pagination: {...pagination, page} }),
      () => this.fetchFilms()
    )
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
    didRenderForm: false,
    createdFilmsCount: null,
    notCreatedFilmsCount: null
  }

  handleSubmit = async film => {
    try {
      await handleApiResponse( fetch(`/api/film`, {
        method: 'POST',
        body: JSON.stringify(film),
        headers: { 'Content-Type': 'application/json' }
      }) )
      this.props.handleSearch()
    } catch (error) {
      this.props.handleError(error)
    }
  }

  handleSearch = () => {
    this.props.handleSearch()
    // this.setState({ didRenderForm: false })
  }

  handleMountModal = filmCounts => {
    this.setState(filmCounts)
  }

  handleCloseModal = () => {
    this.setState({
      createdFilmsCount: null,
      notCreatedFilmsCount: null
    })
  }

  render () {
    const handleError = this.props.handleError
    const didRenderForm = this.state.didRenderForm
    const createdFilmsCount = this.state.createdFilmsCount
    const notCreatedFilmsCount = this.state.notCreatedFilmsCount

    return (
      <>
        <Button
          variant='dark'
          onClick={() => this.setState(({didRenderForm}) => ({didRenderForm: !didRenderForm}))}
          block
        >Add film</Button>
        {didRenderForm && <Form handleSubmit={this.handleSubmit}/>}
        {didRenderForm &&
          <DropZone
            handleSearch={this.handleSearch}
            handleError={handleError}
            handleModal={this.handleMountModal}
          />
        }
        <ModalPortal
          show={!notCreatedFilmsCount && createdFilmsCount}
          title="You\'re file succesfully uploaded!"
          body={`Total files were uploaded to the server ${createdFilmsCount}`}
          handleClose={this.handleCloseModal}
        />
        <ModalPortal
          show={!createdFilmsCount && notCreatedFilmsCount}
          title="You\'re file is broken!"
          body={`The file you want to download does not contain movies, or they are not in the correct format.\r\n
                The correct format is:\r\n
                Name: name,\r\n
                Release Year: releaseYear,\r\n
                Format: VHS, DVD or Blue-Ray,\r\n
                Actors: Name Surname, First name, Last name.`}
          handleClose={this.handleCloseModal}
        />
        <ModalPortal
          show={createdFilmsCount && notCreatedFilmsCount}
          title="Not so simple..."
          body={`Your file uploaded with varying success.\r\n
                Uploaded movies count: ${createdFilmsCount}.\r\n
                Unloaded movies count: ${notCreatedFilmsCount}.`}
          handleClose={this.handleCloseModal}
        />
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

  handleRadioChange = value => {
    this.setState({
      format: value
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

    this.setState({
      name: '',
      releaseYear: '',
      format: '',
      actors: ''
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
          type='number'
          name='releaseYear'
          value={this.state.releaseYear}
          onChange={this.handleInputChange}
        />

        <BForm className='align-items-center'>
          <BForm.Row className='radio'>
            <BForm.Check
              inline
              name='format'
              type='radio'
              id='VHS'
              label='VHS'
              onClick={() => this.handleRadioChange('VHS')}
            />

            <BForm.Check
              inline
              name='format'
              type='radio'
              label='DVD'
              id='DVD'
              onClick={() => this.handleRadioChange('DVD')}
            />

            <BForm.Check
              inline
              name='format'
              type='radio'
              label='Blu-Ray'
              id='Blu-Ray'
              onClick={() => this.handleRadioChange('Blu-Ray')}
            />
          </BForm.Row>
        </BForm>

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

  shouldComponentUpdate (nextProps) {
    return this.props.films !== nextProps.films
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

  changeActivePage = page => {
    this.props.handlePage(page)
    this.setState({activePage: page})
  }

  render () {
    const pageNumbers = []
    for (let i = 1; i <= this.props.pagination.pages; i++) { // такой херни я еще не писал
      pageNumbers.push(i)
    }

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
          {pageNumbers.map(pNum =>
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
    const props = this.props

    const actors = props.actors.map(actor => `${actor.name} ${actor.surname}`).join(', ')
    const uncover = this.state.uncover

    const [, filmNameFirstPart, filmNameSecondPart] = props.name.match(
      new RegExp(`^(${props.searchFilm})(.*)`, 'i')
    ) || [ '', '', props.name]

    const foundedActors = props.searchActor
    ? props.actors
      .filter(({name, surname}) => name.startsWith(props.searchActor) || surname.startsWith(props.searchActor))
      .map(({id, name, surname}, i, arr) => {
        const regexp = new RegExp(`^(${this.props.searchActor})(.*)`, 'i')

        const [, actorNameFirstPart, actorNameSecondPart] = name.match(regexp) || [ '', '', name ]
        const [, actorSurnameFirstPart, actorSurnameSecondPart] = surname.match(regexp) || [ '', '', surname ]

        const separartor = !(i === arr.length - 1)
        return (<Fragment key={id}><b>{actorNameFirstPart}</b>{actorNameSecondPart} <b>{actorSurnameFirstPart}</b>{actorSurnameSecondPart}{separartor && ',  '}</Fragment>)
      })
    : null

    return (
      <div className='filmInfo'>
        <div className='filmCaption'>
          <div id='filmName' onClick={this.handleShow}>
            <b>{filmNameFirstPart}</b>{filmNameSecondPart}
          </div>
          <div
            className='searchActorName'
          ><p>{foundedActors}</p></div>
          <DeleteButton id={this.props.id} handleDelete={this.props.handleDelete}/>
        </div>
        <div className='detailedInfo'>
          {uncover && <p className='actors'><b>Actors:</b> {actors}</p>}
          {uncover && <p className='releaseYear'><b>Release year:</b> {this.props.releaseYear}</p>}
          {uncover && <p className='format'><b>Format:</b> {this.props.format}</p>}
        </div>
      </div>
    )
  }
}

class SearchFilm extends Component {
  onInputChange = (value, key) => {
    return this.props.handleSearch({[key]:value})
  }

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
              onChange={e => this.onInputChange(e.target.value, 'searchFilm')}
              autoComplete='off'
            />
          </Col>
          <Col>
            <BForm.Control
              className='bForm'
              placeholder="Actor name or surname"
              value={this.props.actorSearch}
              onChange={e => this.onInputChange(e.target.value, 'searchActor')}
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
