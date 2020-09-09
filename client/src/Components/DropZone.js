import React from 'react'
import {useDropzone} from 'react-dropzone'

import {handleApiResponse} from '../App'

export default function DropZone (props) {
  const {
    acceptedFiles,
    getRootProps,
    getInputProps
  } = useDropzone({
    accept: 'text/plain',
    maxFiles: 1
  })

  acceptedFiles.forEach(async file => {
    await handleApiResponse( fetch(`/api/importFilms`, {
      method: 'POST',
      body: file
    }) )
    props.handleSearch()
  })

  return (
    <div {...getRootProps({ className: 'dropZone' })}>
      <input {...getInputProps()} />
      <p>Drag 'n' drop some files here, or click to select files</p>
      <em>(Only *.txt files will be accepted)</em>
    </div>
  )
}
