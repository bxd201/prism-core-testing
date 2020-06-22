// @flow
/* eslint-disable */
import React, { useState, useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import QRCode from 'qrcode.react'
import uniqueId from 'lodash/uniqueId'
import * as firebase from 'firebase/app'

import FileInput from '../../FileInput/FileInput'
import AnonLogin from '../../AnonLogin/AnonLogin'

const FILE_UPLOAD_ID = uniqueId('roomTypeDetectorFileUpload_')

function QRCodeUploader ({ setUploadedImage }) {
  const [firebaseStatusMsg, setFirebaseStatusMsg] = useState(null)
  const isLoggedIn = useSelector(state => state.user)
  const storageRef = firebase.storage().ref()

  useEffect(() => {
    console.log(isLoggedIn.uid)
  }, [isLoggedIn])

  const handleUpload = useCallback((e) => {
    const queryString = window.location.search
    const params = queryString.replace('?', '').split('&')
    const paramPairs = params.map(pair => pair.split('='))
    const uid = paramPairs[0][1]

    const file = e.target.files[0]
    const imgRef = storageRef.child(`example.png`)
    const uploadImgRef = storageRef.child(`scenes/${uid}/example.png`)

    const uploadTask = uploadImgRef.put(file)

    uploadTask.on('state_changed', (snapshot) => {

    }, (err) => {

    }, () => {
      setFirebaseStatusMsg('Upload Complete.')
    })
  })

  const downloadFirebaseImg = () => {
    const imgRef = storageRef.child(`scenes/${isLoggedIn.uid}/example.png`)
    imgRef.getDownloadURL().then(url => setUploadedImage(url))
  }

  return (
    <>
      {FIREBASE_AUTH_ENABLED && !isLoggedIn ? <AnonLogin /> : null}
      <QRCode value={`https://replatform-prism-web.ebus.swaws/templates/iris/iris.html?uid=${isLoggedIn.uid}`} />
      <FileInput onChange={handleUpload} disabled={false} id={FILE_UPLOAD_ID} placeholder={`SELECT IMAGE`} />
      <p><button onClick={downloadFirebaseImg}>Push Button, Get Bacon</button></p>
      <p>{firebaseStatusMsg}</p>
      <hr />
    </>
  )
}

export default QRCodeUploader
