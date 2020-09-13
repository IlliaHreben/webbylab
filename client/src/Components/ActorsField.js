import React, { useState } from 'react'
import { TextField, IconButton } from '@material-ui/core'
import { Delete as DeleteIcon } from '@material-ui/icons'

export default props => {
  const lastElementProps = props.lastElement
    ? { onClick: props.addField,
        styles: { marginBottom: '1em' },
        error: false,
        helperText: false
      }
    : {}
  const styledField = { style: {
    marginLeft:'0.5em',
    marginRigth:'0.5em',
    marginBottom: props.lastElement ? '1em' : '0'
  } }

  const [emptyFields, setEmptyField] = useState([])

  const onBlurHandler = e => {
    const target = e.currentTarget
    if (target.value === '') setEmptyField(emptyFields.concat([target.name]) )
  }

  const onInputChange = e => {
    setEmptyField(emptyFields.filter(emptyField => emptyField !== e.target.name))
    props.onChange(e, props.id)
  }

  return (
    <div style={{display:'flex', justifyContent: 'center', alignItems: 'center'}} >
      <TextField {...styledField}
        {...!!props.sameActor || emptyFields.includes('name') ?
          {
            error: true,
            helperText: props.actor.name === ''
              ? 'Name must be filled.'
              : 'Actors must be unique.'
          } : {} }
        onBlur={onBlurHandler}
        inputProps={{ maxLength: 90 }}
        autoComplete='true'
        name='name'
        label='Name'
        variant='filled'
        value={props.actor.name}
        onChange={onInputChange}
        {...lastElementProps}
      />
      <TextField {...styledField}
        {...!!props.sameActor || emptyFields.includes('surname') ?
          {
            error: true,
            helperText: props.actor.surname === ''
              ? 'Surname must be filled.'
              : 'Actors must be unique.'
          } : {} }
        onBlur={onBlurHandler}
        inputProps={{ maxLength: 90 }}
        autoComplete='true'
        name='surname'
        label='Surname'
        variant='filled'
        value={props.actor.surname}
        onChange={onInputChange}
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
