import React from 'react'
import {useDropzone} from 'react-dropzone'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCloudUploadAlt } from '@fortawesome/free-solid-svg-icons'

import {handleApiResponse} from '../App'

export default function DropZone (props) {
  const {
    acceptedFiles,
    getRootProps,
    getInputProps,
    isDragActive
  } = useDropzone({
    accept: 'text/plain',
    maxFiles: 1
  })

  acceptedFiles.forEach(async file => {
    try {
      await handleApiResponse( fetch(`/api/importFilms`, {
        method: 'POST',
        body: file
      }) )
      props.handleSearch()
    } catch (err) {
      this.props.handleError(err)
    }

  })

  return (
    <div {...getRootProps({ className: 'dropZone' })}>
      <input {...getInputProps()} />
      {!isDragActive
        ? (<>
            <FontAwesomeIcon color='#343a40' icon={faCloudUploadAlt} size='8x' />
            <p>Drag 'n' drop some files here, or click to select files</p>
            <p>(Only *.txt files will be accepted)</p>
          </>)
        : (<>
            <FontAwesomeIcon color='#23272b' icon={faCloudUploadAlt} size='8x' />
            <p>Yeah. Drop here!</p>
            <br />
          </>)

      }

    </div>
  )
}
