import React from 'react'
import { Alert, Pagination } from '@material-ui/lab'
import { makeStyles } from '@material-ui/core/styles'

import handleApiResponse from '../App.js'
import FilmInfo from './FilmInfo'

const useStyles = makeStyles((theme) => ({
  root: {
    '& > *': {
      marginTop: theme.spacing(2),
      alignItems: 'center',
      justifyContent: 'center',

    },
    margin: '1em',
    justifyContent: 'center',
  },
  ul: {
    alignItems: 'center',
    justifyContent: 'center',
  }
}))

const AllFilms = props => {

  const handleDeleteFilm = async id => {
    try {
      await handleApiResponse(
        fetch(`/api/film?id=${id}`,{
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        })
      )
      props.handleDelete(id)
    } catch (error) {
      props.handleError(error)
    }
  }

  const changeActivePage = (_, page) => {
    props.handlePage(page)
  }

  const classes = useStyles()

  return (
    <div className='allFilms'>
      {!props.films.length &&
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
      {props.films.map(film =>
        <FilmInfo
          key={film.id}
          handleError={props.handleError}
          handleDelete={handleDeleteFilm}
          {...film}
          searchFilm={props.searchFilm}
          searchActor={props.searchActor}
        />
      )}
      <div className={classes.root} >
        <Pagination classes={{ ul: classes.ul }}
          color='secondary'
          count={props.pagination.pages}
          onChange={changeActivePage}
        />
      </div>
    </div>
  )
}

export default React.memo(AllFilms, (props, nextProps)=> {
  return props.films === nextProps.films
})
