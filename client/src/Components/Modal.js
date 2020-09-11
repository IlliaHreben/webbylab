import React from 'react'
import ReactDOM from 'react-dom'
import { Modal, Button } from 'react-bootstrap'

const ModalPortal = props => {
  const {title, body} = props
  return ReactDOM.createPortal(
      <Modal show={!!props.show} onHide={props.handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{body}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={props.handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={props.handleClose}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>,
    document.getElementById('root')
  )
}

export default ModalPortal
