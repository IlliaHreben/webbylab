import React, { Component } from 'react'
import { Snackbar, Button } from '@material-ui/core'
import { KeyboardArrowUp } from '@material-ui/icons'
import { Alert } from '@material-ui/lab'
import 'fontsource-roboto'

import DropZone from './DropZone'
import ModalPortal from './Modal'
import BackDrop from './BackDrop'
import Form from './Form'
import { handleApiResponse } from '../App.js'

export default class AddFilm extends Component {
  state = {
    didRenderForm: false,
    createdFilmsCount: null,
    notCreatedFilmsCount: null,
    didRenderSuccesMessage: false,
    didRenderBackDrop: false
  }

  handleSubmit = async film => {
    try {
      const res = await handleApiResponse( fetch(`/api/film`, {
        method: 'POST',
        body: JSON.stringify(film),
        headers: { 'Content-Type': 'application/json' }
      }) )
      this.props.fetchFilms()
      this.setState({didRenderSuccesMessage: true})
      return res
    } catch (error) {
      this.props.handleError(error)
      return error
    }
  }

  renderBackDrop = didRenderBackDrop => {
    this.setState({didRenderBackDrop})
  }

  handleMountModal = filmCounts => {
    this.setState(filmCounts)
  }

  handleCloseModal = () => {
    this.setState({
      createdFilmsCount: null,
      notCreatedFilmsCount: null,
      didRenderForm: false
    })
  }

  render () {
    const handleError = this.props.handleError
    const didRenderForm = this.state.didRenderForm
    const createdFilmsCount = this.state.createdFilmsCount
    const notCreatedFilmsCount = this.state.notCreatedFilmsCount

    const arrowStyle = {
      alignItems: 'center',
      transition: '.3s',
      ...(didRenderForm ? {} : { transform: 'rotate(-180deg)' })
    }

    return (
      <>
        <Button
          endIcon={<KeyboardArrowUp style={arrowStyle} />}
          fullWidth={true}
          variant='contained'
          color='primary'
          onClick={() => this.setState(({didRenderForm}) => ({didRenderForm: !didRenderForm}))}
        >Add film</Button>
        {didRenderForm && <Form handleSubmit={this.handleSubmit}/>}
        {didRenderForm &&
          <DropZone
            fetchFilms={this.props.fetchFilms}
            handleError={handleError}
            handleModal={this.handleMountModal}
            renderBackDrop={this.renderBackDrop}
          />
        }
        <BackDrop  open={this.state.didRenderBackDrop} />
        <ModalPortal
          show={!notCreatedFilmsCount && createdFilmsCount}
          title={<p style={{ margin: 0}}>File succesfully uploaded!</p>}
          body={<p style={{margin: 0}}>Total films were uploaded to the server <b>{createdFilmsCount}</b>.</p>}
          handleClose={this.handleCloseModal}
        />
        <ModalPortal
          show={!createdFilmsCount && notCreatedFilmsCount}
          title={<p style={{ margin: 0}}>File is broken, or all films are already exist.</p>}
          body={<p style={{margin: 0}}>The file you want to upload does not contain movies, or they are not in the correct format.<br/>
                The correct format is:<br/>
                <b>Name:</b> name,<br/>
                <b>Release Year:</b> releaseYear,<br/>
                <b>Format:</b> VHS, DVD or Blue-Ray,<br/>
                <b>Actors:</b> Name Surname, FirstName LastName.</p>}
          handleClose={this.handleCloseModal}
        />
        <ModalPortal
          show={createdFilmsCount && notCreatedFilmsCount}
          title={<p style={{ margin: 0}}>Not so simple...</p>}
          body={<p style={{margin: 0}}>Your file uploaded with varying success.<br/>
                If you are shown more films than you downloaded, it means that you have not complied the format. Most likely there are extra line breaks or characters at the end of your file.<br/><br/>
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
