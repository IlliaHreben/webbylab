import React, {useCallback, useMemo} from 'react'
import { useDropzone } from 'react-dropzone'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCloudUploadAlt } from '@fortawesome/free-solid-svg-icons'

import {handleApiResponse} from '../App'

export default function DropZone (props) {
  const baseStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    borderWidth: 2,
    borderStyle: 'dashed',
    color: '#999999',
    outline: 'none',
    transition: 'border .3s ease-in-out'
  }
  const activeStyle = {
    borderColor: '#2196f3'
  }
  const acceptStyle = {
    borderColor: '#00e676'
  }
  const rejectStyle = {
    borderColor: '#ff1744'
  }

  const onDrop = useCallback(acceptedFiles => {
    acceptedFiles.forEach(async file => {
      try {
        console.log(file)
        const films = await handleApiResponse( fetch(`/api/importFilms`, {
          method: 'POST',
          body: file,
          headers: {'Content-Type': 'text/plain'}
        }) )
        props.handleSearch()
        console.log(films)
        const createdFilmsCount = films.filter(({ok}) => ok).length
        const notCreatedFilmsCount = films.filter(({ok}) => !ok).length
        props.handleModal({
          createdFilmsCount,
          notCreatedFilmsCount
        })

      } catch (err) {
        props.handleError(err)
      }
    })
  }, [props])

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
    onDropRejected
  } = useDropzone({onDrop, accept: 'text/plain'})

  if (onDropRejected) {
    console.log('______________----')
    props.handleError({
    code: 'INVALID_FILE_FORMAT',
    message: 'The file must have permission .txt'
  })}

  const style = useMemo(() => ({
    ...baseStyle,
    ...(isDragActive ? activeStyle : {}),
    ...(isDragAccept ? acceptStyle : {}),
    ...(isDragReject ? rejectStyle : {})
  }), [baseStyle, isDragActive, activeStyle, isDragAccept, acceptStyle, isDragReject, rejectStyle])

  return (
    <div {...getRootProps({ className: 'dropZone', style })}>
      <input {...getInputProps({multiple: false, accept: 'text/plain'})} />
      {!isDragActive
        ? (<>
            <UploadIcon color='#343a40' />
            <p>Drag 'n' drop some files here, or click to select files</p>
            <p>(Only *.txt files will be accepted)</p>
          </>)
        : (<>
            <UploadIcon color='#23272b' />
            {isDragAccept? <p>Yeah. Drop here!</p> : <p>NO NO NO!!! Bad format!!!</p>}
            <br />
          </>)
      }

    </div>
  )
}

const UploadIcon = props => {
  return <FontAwesomeIcon color={props.color} icon={faCloudUploadAlt} size='8x' />
}
