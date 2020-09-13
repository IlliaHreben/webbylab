import React, { Component } from 'react'
import { Snackbar } from '@material-ui/core'
import { Alert } from '@material-ui/lab'

import 'fontsource-roboto'
import debounce from 'lodash/debounce'

import './App.css'
import AllFilms from './Components/AllFilms'
import AddFilm from './Components/AddFilm'
import SearchFilm from './Components/SearchFilm'

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
          fetchFilms={this.fetchFilms}
          pagination={this.state.pagination}
          handlePage={this.handlePage}
          handleError={this.handleError}
          searchFilm={this.state.searchFilm}
          searchActor={this.state.searchActor}
        />
        <AddFilm
          handleForm={this.handleForm}
          handleError={this.handleError}
          fetchFilms={this.fetchFilms}
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
