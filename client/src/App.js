import React, { Component, Fragment } from 'react'
import { Alert as BAlert, Pagination, Form as BForm, Col } from 'react-bootstrap'
import { Snackbar, TextField, RadioGroup,
  FormControlLabel, FormControl, FormLabel,
  Radio, Button, Icon, IconButton
} from '@material-ui/core'
import { Delete as DeleteIcon } from '@material-ui/icons'
import { Alert } from '@material-ui/lab'
import 'bootstrap/dist/css/bootstrap.min.css'

import 'fontsource-roboto'
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
    error: {show: false}
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
    this.setState({error: {show: true, ...error}})
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
        <Snackbar
          open={error.show}
          autoHideDuration={3000}
          onClose={() => this.setState({error: {show: false}})}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert variant='filled' severity='error'>
            {error.show ? error.message : null}
          </Alert>
        </Snackbar>
      </>
    )
  }
}

class AddFilm extends Component {
  state = {
    didRenderForm: false,
    createdFilmsCount: null,
    notCreatedFilmsCount: null,
    didRenderSuccesMessage: false
  }

  handleSubmit = async film => {
    try {
      const res = await handleApiResponse( fetch(`/api/film`, {
        method: 'POST',
        body: JSON.stringify(film),
        headers: { 'Content-Type': 'application/json' }
      }) )
      this.props.handleSearch()
      this.setState({didRenderSuccesMessage: true})
      return res
    } catch (error) {
      this.props.handleError(error)
      return error
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
          fullWidth='true'
          variant='contained'
          color='primary'
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
          title={<p style={{color: 'green', margin: 0}}>You're file succesfully uploaded!</p>}
          body={<p style={{margin: 0}}>Total files were uploaded to the server <b>{createdFilmsCount}</b>.</p>}
          handleClose={this.handleCloseModal}
        />
        <ModalPortal
          show={!createdFilmsCount && notCreatedFilmsCount}
          title={<p style={{color: 'red', margin: 0}}>You're file is broken, or all films are already yet.</p>}
          body={<p style={{margin: 0}}>The file you want to download does not contain movies, or they are not in the correct format.<br/>
                The correct format is:<br/>
                <b>Name:</b> name,<br/>
                <b>Release Year:</b> releaseYear,<br/>
                <b>Format:</b> VHS, DVD or Blue-Ray,<br/>
                <b>Actors:</b> Name Surname, FirstName LastName.</p>}
          handleClose={this.handleCloseModal}
        />
        <ModalPortal
          show={createdFilmsCount && notCreatedFilmsCount}
          title={<p style={{color: 'yellow', margin: 0}}>Not so simple...</p>}
          body={<p style={{margin: 0}}>Your file uploaded with varying success.<br/>
                Uploaded movies count: <b>{createdFilmsCount}</b>.<br/>
                Unloaded movies count: <b>{notCreatedFilmsCount}</b>.</p>}
          handleClose={this.handleCloseModal}
        />
        <Snackbar
          open={this.state.didRenderSuccesMessage}
          autoHideDuration={3000}
          onClose={() => this.setState({didRenderSuccesMessage: false})}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert variant='filled' severity='success'>
            The film was successfully created!
          </Alert>
        </Snackbar>
      </>
    )
  }
}

class Form extends Component {
  state = {
    name: '',
    releaseYear: '',
    isCorrectReleaseYear: true,
    format: '',
    actors: [{ name: '', surname: '' }]
  }

  handleInputChange = e => {
    const value = e.target.value
    const name = e.target.name

    const nextState = {
      [name]: value
    }

    if (name === 'releaseYear') {
      this.handleIsCorrectReleaseYear(value)
    }

    this.setState(nextState)
  }

  handleSubmitOnClick = async () => {

    const res =  await this.props.handleSubmit({
      name: this.state.name,
      releaseYear: this.state.releaseYear,
      format: this.state.format,
      actors: this.state.actors.filter(({ name, surname }) => name && surname)
    })
    if (!res.code) {
      this.setState({
        name: '',
        releaseYear: '',
        format: '',
        actors: [{ name: '', surname: '' }],
        isCorrectReleaseYear: true
      })
    }
  }

  handleIsCorrectReleaseYear = debounce(releaseYear => {
    this.setState({
      isCorrectReleaseYear: (( releaseYear > 1895 )
        && (releaseYear < new Date().getFullYear()))
        || releaseYear === ''
    })
  }, 600)

  deleteActor = id => {
    this.setState(({actors}) => ({ actors: actors.filter((_, i) => id !== i )}))
  }

  setActor = (e, id) => {
    const key = e.target.name
    const value = e.target.value.trim().replace(/[0-9]/g, '')
    const actor = { [key]: value }
    this.setState(({actors}) => {
      actors[id] = {...actors[id], ...actor}
      return {actors}
    } )
  }

  addField = () => {
    this.setState(({actors}) => ({ actors: actors.concat({name:'', surname:''}) }) )
  }

  render () {
    const state = this.state
    const isCorrectReleaseYear = this.state.isCorrectReleaseYear
    return (
      <div className='addFilm'>
        <FormControl component='fieldset'>
        <TextField
          inputProps={{ maxLength: 90 }}
          variant='filled'
          type='text'
          name='name'
          id='filled-basic'
          label='Film name'
          value={state.name}
          onChange={this.handleInputChange}
        />

        <TextField
          {...isCorrectReleaseYear
            ? {}
            : { error: true, helperText:'Year must be between 1895 and current.' }
          }
          variant='filled'
          name='releaseYear'
          type='number'
          id='filled-basic'
          label='Release year'
          value={state.releaseYear}
          onChange={this.handleInputChange}
        />
        <RadioGroup row style={{justifyContent: 'center', marginTop: '0.5em'}}
          color='secondary'
          className='format'
          aria-label='Film format'
          name='format'
          value={state.format}
          onChange={this.handleInputChange}
        >
          <FormControlLabel value='VHS' control={<Radio />} label='VHS' />
          <FormControlLabel value='DVD' control={<Radio />} label='DVD' />
          <FormControlLabel value='Blu-Ray' control={<Radio />} label='Blu-Ray' />
        </RadioGroup>

        {this.state.actors.map((actor, i, arr) => <ActorsField
          key={i} id={i}
          actor={actor}
          onChange={this.setActor}
          deleteActor={this.deleteActor}
          lastElement={i + 1 === arr.length}
          addField={this.addField}
        />)}
        <Button
          fullWidth='true'
          variant='contained'
          color='primary'
          onClick={this.handleSubmitOnClick}
          endIcon={<Icon>send</Icon>}
          block
        >Send</Button>
        </FormControl>
      </div>
    )
  }

}

const ActorsField = props => {
  const lastElementProps = props.lastElement ? { onClick: props.addField, styles: { marginBottom: '1em' } } : {}
  const styledField = { style: { marginLeft:'0.5em', marginRigth:'0.5em', marginBottom: props.lastElement ? '1em' : '0'} }
  return (
    <div style={{display:'flex', justifyContent: 'center', alignItems: 'center'}} >
      <TextField {...styledField}
        inputProps={{ maxLength: 90 }}
        autoComplete='true'
        name='name'
        label='Name'
        variant='filled'
        value={props.actor.name}
        onChange={e => props.onChange(e, props.id)}
        {...lastElementProps}
      />
      <TextField {...styledField}
        inputProps={{ maxLength: 90 }}
        autoComplete='true'
        name='surname'
        label='Surname'
        variant='filled'
        value={props.actor.surname}
        onChange={e => props.onChange(e, props.id)}
        {...lastElementProps}
      />
      <IconButton
        disabled={props.lastElement}
        aria-label='delete'
        onClick={() => props.deleteActor(props.id)}
      >
        <DeleteIcon fontSize='small' />
      </IconButton>
    </div>

  )
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
          <Alert
            severity='info' color='#818182'
            style={{margin: '0.1em', marginBottom: '-1.2em', justifyContent: 'center', padding: '1em'}}
          >No movies found. Please add a new movie or change your search parameters.</Alert>
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
              maxlength='90'
              className='bForm'
              placeholder="Film name"
              value={this.props.filmSearch}
              onChange={e => this.onInputChange(e.target.value, 'searchFilm')}
              autoComplete='off'
            />
          </Col>
          <Col>
            <BForm.Control
              maxlength='90'
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
