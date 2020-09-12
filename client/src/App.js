import React, { Component, Fragment } from 'react'
import { Pagination } from 'react-bootstrap'
import { Snackbar, TextField, RadioGroup, FormControlLabel, FormControl, Radio,
  Button, Icon, IconButton, Grid, Paper, Accordion, AccordionSummary, Typography,
  AccordionDetails, AccordionActions
} from '@material-ui/core'
import MuiAccordion from '@material-ui/core/Accordion'
import { Delete as DeleteIcon, ExpandMore as ExpandMoreIcon } from '@material-ui/icons'
import { Alert } from '@material-ui/lab'
import 'bootstrap/dist/css/bootstrap.min.css'
import { makeStyles, withStyles } from '@material-ui/core/styles'

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
          onClose={() => this.setState(({error}) => ({error: {...error, show: false}}))}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert variant='filled' severity='error'>
            {error.message}
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
          fullWidth={true}
          variant='contained'
          color='primary'
          onClick={() => this.setState(({didRenderForm}) => ({didRenderForm: !didRenderForm}))}
        >Add film</Button>
        {didRenderForm && <Form handleSubmit={this.handleSubmit}/>}
        {didRenderForm &&
          <DropZone
            handleSearch={this.props.handleSearch}
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
    actors: [{ name: '', surname: '' }],
    sameActor: false
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
    this.setState(({actors, sameActor}) => ({
      actors: actors.filter((_, i) => id !== i ),
      sameActor: sameActor && sameActor.id.includes(id) ? false : sameActor
    }))
  }

  setActor = (e, id) => {
    const key = e.target.name
    const value = e.target.value.trim().replace(/[0-9]/g, '')
    const actor = { [key]: value }

    this.setState(({actors}) => {
      const actorSameId = this.didElementHaveSameId(actors, {...actors[id], ...actor})
      const newActors = actors.map((prevActor, i) => i === id ? {...actors[id], ...actor} : prevActor)
      if (value !== '') {
        this.setSameActor(actorSameId !== -1 ? {id: [actorSameId, id], key} : false)
      }


      return {actors: newActors, sameActor: false}
    } )
  }

  setSameActor = debounce (actor => {
    this.setState({sameActor: actor})
  }, 600)

  didElementHaveSameId = (array, element) => {
    return array.map(checkingElement => {
      return JSON.stringify(checkingElement) === JSON.stringify(element)
    }).indexOf(true)
  }

  addField = () => {
    this.setState(({actors}) => ({ actors: actors.concat({name:'', surname:''}) }) )
  }

  render () {
    const state = this.state
    const isCorrectReleaseYear = this.state.isCorrectReleaseYear
    const sameActor = this.state.sameActor
    const didSendButtonEnabled = state.name
      && state.releaseYear
      && state.isCorrectReleaseYear
      && state.format
      && state.actors.filter(({name, surname}) => name && surname)[0]
      && !sameActor

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
          sameActor={sameActor && sameActor.id.includes(i) ? sameActor.key : false}
          key={i} id={i}
          actor={actor}
          onChange={this.setActor}
          deleteActor={this.deleteActor}
          lastElement={i + 1 === arr.length}
          addField={this.addField}
        />)}
        <Button
          disabled={!didSendButtonEnabled}
          fullWidth={true}
          variant='contained'
          color='primary'
          onClick={this.handleSubmitOnClick}
          endIcon={<Icon>send</Icon>}
        >Send</Button>
        </FormControl>
      </div>
    )
  }

}

const ActorsField = props => {
  const lastElementProps = props.lastElement
    ? { onClick: props.addField, styles: { marginBottom: '1em' } }
    : {}
  const styledField = { style: {
    marginLeft:'0.5em',
    marginRigth:'0.5em',
    marginBottom: props.lastElement ? '1em' : '0'
  } }
  const sameActor =
    props.sameActor
    ? { error: true, helperText: 'Actors must be unique.' }
    : {}
  return (
    <div style={{display:'flex', justifyContent: 'center', alignItems: 'center'}} >
      <TextField {...styledField}
        {...sameActor}
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
        {...sameActor}
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
            severity='info' color='info'
            style={{
              margin: '0.1em',
              marginBottom: '-1.2em',
              justifyContent: 'center',
              padding: '1em'
            }}
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

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: 'white',
    padding: '0.5em',
    borderRadius: '4px',
    marginTop: '0.8em',
    color: theme.palette.text.secondary
  },
  input: {
    justifyContent: 'stretch',
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    flexBasis: '50%',
    flexShrink: 0,
    textTransform: 'uppercase'
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
  }
}))

const FilmInfo = props => {

  const actors = props.actors.map(actor => `${actor.name} ${actor.surname}`).join(', ')

  const [, filmNameFirstPart, filmNameSecondPart] = props.name.match(
    new RegExp(`^(${props.searchFilm})(.*)`, 'i')
  ) || [ '', '', props.name]

  const foundedActors = props.searchActor
  ? props.actors
    .filter(({name, surname}) =>
      name.startsWith(props.searchActor) || surname.startsWith(props.searchActor))
    .map(({id, name, surname}, i, arr) => {
      const regexp = new RegExp(`^(${props.searchActor})(.*)`, 'i')

      const [
        ,
        actorNameFirstPart,
        actorNameSecondPart
      ] = name.match(regexp) || [ '', '', name ]
      const [
        ,
        actorSurnameFirstPart,
        actorSurnameSecondPart
      ] = surname.match(regexp) || [ '', '', surname ]

      const separartor = !(i === arr.length - 1)
      return (<Fragment key={id}>
        <b>{actorNameFirstPart}</b> {actorNameSecondPart}
        <b>{actorSurnameFirstPart}</b> {actorSurnameSecondPart}{separartor && ',  '}
      </Fragment>)
    })
  : null

  const classes = useStyles()

  return (
    <Accordion >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
      >
        <Typography
          className={classes.heading}
        >
          <b>{filmNameFirstPart}</b>{filmNameSecondPart}
        </Typography>
        <Typography className={classes.secondaryHeading} >{foundedActors}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography>
          <b>Actors:</b> {actors}<br/>
          <b>Release year:</b> {props.releaseYear}<br/>
          <b>Format:</b> {props.format}<br/>
        </Typography>
      </AccordionDetails>
      <AccordionActions>
        <DeleteButton id={props.id} handleDelete={props.handleDelete}/>
      </AccordionActions>
    </Accordion>
  )
}

function SearchFilm (props) {
  const onInputChange = (value, key) => {
    return props.handleSearch({[key]:value})
  }


  const classes = useStyles()
  return (
    <Paper className={classes.root}>
      <Grid container spacing={1}>
        <Grid item xs={6}>
          <TextField
            maxLength='90'
            fullWidth={true}
            className={classes.input}
            label='Film name'
            variant='outlined'
            value={props.filmSearch}
            onChange={e => onInputChange(e.target.value, 'searchFilm')}
            autoComplete='off'
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            maxLength='90'
            fullWidth={true}
            className={classes.input}
            label='Actor name or surname'
            variant='outlined'
            value={props.actorSearch}
            onChange={e => onInputChange(e.target.value, 'searchActor')}
            autoComplete='off'
          />
        </Grid>
      </Grid>
    </Paper>
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
