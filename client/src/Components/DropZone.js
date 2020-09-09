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
  });

  const acceptedFileItems = acceptedFiles.map(async file => {
    const films = await handleApiResponse( fetch(`/api/importFilms`, {
      method: 'POST',
      body: file
    }) )
    return (
    <li key={file.path}>
      {file.path} - {file.size} bytes
    </li>
    )
  })

  return (
    <>
      <div {...getRootProps({ className: 'dropZone' })}>
        <input {...getInputProps()} />
        <p>Drag 'n' drop some files here, or click to select files</p>
        <em>(Only *.txt files will be accepted)</em>
      </div>
        <h4>{acceptedFileItems}</h4>
    </>
  )
}
