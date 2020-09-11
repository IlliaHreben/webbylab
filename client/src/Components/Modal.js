import React from 'react'
import ReactDOM from 'react-dom'
import { Modal } from 'react-bootstrap'

const ModalPortal = props => {
  const {title, body} = props
  return ReactDOM.createPortal(
      <Modal show={!!props.show} onHide={props.handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{body}</Modal.Body>
      </Modal>,
    document.getElementById('root')
  )
}

export default ModalPortal
