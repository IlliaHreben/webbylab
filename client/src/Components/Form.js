import React, { Component } from 'react'
import debounce from 'lodash/debounce'
import { TextField, RadioGroup, FormControlLabel, FormControl, Radio, Button } from '@material-ui/core'
import { Send } from '@material-ui/icons'

import ActorsField from './ActorsField'

export default class Form extends Component {
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
    const value = e.target.value
    const actor = { [key]: value }

    this.setState(({actors}) => {
      const actorSameId = this.actorWhoHaveSameFields(actors, {...actors[id], ...actor})
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

  actorWhoHaveSameFields = (array, element) => {
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
      && state.actors
          .slice(0, -1)
          .filter(({name, surname}) => name && surname)
          .length === state.actors.length -1
      && state.actors.length > 1
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
          endIcon={<Send />}
        >Send</Button>
        </FormControl>
      </div>
    )
  }

}
