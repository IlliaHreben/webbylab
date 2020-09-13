import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { TextField, Grid, Paper } from '@material-ui/core'

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
  }
}))

export default function SearchFilm (props) {
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
            variant='filled'
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
            variant='filled'
            value={props.actorSearch}
            onChange={e => onInputChange(e.target.value, 'searchActor')}
            autoComplete='off'
          />
        </Grid>
      </Grid>
    </Paper>
  )
}
