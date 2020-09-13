import React from 'react'
import ReactDOM from 'react-dom'
import { Dialog, DialogTitle, DialogContent,
  DialogContentText, DialogActions, Button } from '@material-ui/core'

const ModalPortal = props => {
  const {title, body} = props
  return ReactDOM.createPortal(
    <Dialog
      open={!!props.show}
      onClose={props.handleClose}
      aria-labelledby='alert-dialog-title'
      aria-describedby='alert-dialog-description'
    >
      <DialogTitle id='alert-dialog-title'>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id='alert-dialog-description'>
          {body}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.handleClose} color='primary' autoFocus>
          Close
        </Button>
      </DialogActions>
    </Dialog>,
    document.getElementById('root')
  )
}

export default ModalPortal
