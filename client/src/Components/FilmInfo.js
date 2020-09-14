import React, { Fragment } from 'react'
import {
  Accordion, AccordionSummary, Typography, AccordionDetails, AccordionActions
} from '@material-ui/core'
import { ExpandMore as ExpandMoreIcon } from '@material-ui/icons'
import { makeStyles } from '@material-ui/core/styles'

import DeleteButton from './DeleteButton'

const useStyles = makeStyles((theme) => ({
  heading: {
    fontSize: theme.typography.pxToRem(15),
    flexBasis: '50%',
    flexShrink: 0,
    textTransform: 'uppercase'
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
  },
  accordionBody: {
    paddingBottom: 0,
    paddingTop: 0
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
      name.toUpperCase().startsWith(props.searchActor.toUpperCase())
      || surname.toUpperCase().startsWith(props.searchActor.toUpperCase())
    )
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
      return (
        <Fragment key={id}>
          <b>{actorNameFirstPart}</b>{actorNameSecondPart}{' '}
          <b>{actorSurnameFirstPart}</b>{actorSurnameSecondPart}{separartor && ',  '}
        </Fragment>
      )
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
      <AccordionDetails className={classes.accordionBody} >
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

export default FilmInfo
