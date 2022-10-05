// @flow
import React, { useCallback, useEffect, useRef,useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import * as tf from '@tensorflow/tfjs'
import HeroLoader from 'src/components/Loaders/HeroLoader/HeroLoader'
import GenericMessage from 'src/components/Messages/GenericMessage'
import facetBinder from 'src/facetSupport/facetBinder'
import useDeepLabModel, { deepLabModels } from 'src/shared/hooks/useDeepLabModel'
import useDeepLabModelForSegmentation from 'src/shared/hooks/useDeepLabModelForSegmentation'
import useEffectAfterMount from 'src/shared/hooks/useEffectAfterMount'
import { uploadImage } from 'src/store/actions/user-uploads'
import MainPage from './components/MainPage/MainPage'
import ProcessingPage from './components/ProcessingPage/ProcessingPage'
import ResultsPage from './components/ResultsPage/ResultsPage'
import './JumpStartFacet.scss'
import './JSFCommon.scss'

export type RoomType = 'pantry' | 'recreation_room' | 'kitchen' | 'home_office' | 'bedroom' | 'patio' | 'living_room' | 'staircase' | 'dining_room' | 'attic' | 'basement' | 'bathroom' | 'corridor'

const PHASES = {
  INIT: 'INIT',
  LOADING: 'LOADING',
  PROCESSING: 'PROCESSING',
  RESULTS: 'RESULTS',
  ERROR: 'ERROR'
}

const PHASE_ORDER = [
  PHASES.INIT,
  PHASES.LOADING,
  PHASES.PROCESSING,
  PHASES.RESULTS
]

const baseClass = 'JumpStartFacet'

function JumpStartFacet () {
  const dispatch = useDispatch()
  const [status, setStatus] = useState(PHASES[PHASE_ORDER[0]])
  const [uploadedImage, setUploadedImage] = useState(null)
  const { error: fmError } = useSelector(state => state.uploads)
  const [isError, setIsError] = useState(false)
  const [deeplabModel, , modelError] = useDeepLabModel(deepLabModels.ADE20K, 4)
  const [irisData, irisSuccess, irisError, , irisProcessing] = useDeepLabModelForSegmentation(deeplabModel, uploadedImage)
  const [completionBarriers, setCompletionBarriers] = useState(1) // default is ALWAYS 1
  const [isProcessingDone, setProcessingDone] = useState(false)

  const roomTypeProbabilities: { current: [RoomType, number][] } = useRef([])
  const [roomRecognitionModel, setRoomRecognitionModel] = useState()

  useEffect(() => { tf.loadGraphModel('src/shared/model/model.json').then(setRoomRecognitionModel) }, [])

  useEffect(() => {
    if (!uploadedImage || !roomRecognitionModel) { return }

    const img = new Image(224, 224)
    img.src = uploadedImage
    img.onload = () => {
      let imgTensor = tf.browser.fromPixels(img).asType('float32').expandDims()
      // normalize the img tensor to be between -1 and 1. Formula used on the python side: img = (img - np.mean(img)) / 255
      imgTensor = imgTensor.sub(imgTensor.mean()).div(255)
      roomRecognitionModel && roomRecognitionModel.predict(imgTensor).array().then(([results]) => {
        const roomTypes = ['pantry', 'recreation_room', 'kitchen', 'home_office', 'bedroom', 'patio', 'living_room', 'staircase', 'dining_room', 'attic', 'basement', 'bathroom', 'corridor']
        roomTypeProbabilities.current = roomTypes
          // convert to tuples
          .map((roomType, index): [RoomType, number] => [roomType, results[index]])
          // sort by decending ranking
          .sort(([, ranking1], [, ranking2]) => ranking2 - ranking1)
      })
    }
  }, [uploadedImage, roomRecognitionModel])

  const reset = () => {
    setIsError(false)
    setStatus(PHASES[PHASE_ORDER[0]])
    setCompletionBarriers(1)
    setProcessingDone(false)
  }

  const decrementCompletionBarriers = useCallback(() => {
    setCompletionBarriers(completionBarriers - 1)
  }, [completionBarriers])

  useEffectAfterMount(() => {
    if (completionBarriers === 0 && isProcessingDone) {
      // THIS TIMEOUT GIVE THE LOADER TIME TO RAZZLE DAZZLE WITH PIZZAZZ
      window.setTimeout(() => {
        setStatus(PHASES.RESULTS)
      }, 2000)
    }
  }, [completionBarriers, isProcessingDone])

  useEffect(() => {
    if ([PHASES.LOADING, PHASES.PROCESSING].indexOf(status) > -1 && irisProcessing) {
      setStatus(PHASES.PROCESSING)
    }
  }, [status, irisProcessing])

  useEffect(() => {
    if (irisSuccess && irisData) {
      decrementCompletionBarriers()
    }
  }, [irisSuccess, irisData])

  useEffect(() => {
    if (irisError || modelError || fmError) {
      setStatus(PHASES.ERROR)
    }
  }, [irisError, modelError, fmError])

  const handleFileUpload = (file: File) => {
    setUploadedImage(URL.createObjectURL(file))
    dispatch(uploadImage(file))
    setStatus(PHASES.LOADING)
  }
  if ((!irisSuccess && status === PHASES.LOADING) || (!irisSuccess && status === PHASES.PROCESSING)) {
    return (<><div className={'jumpstart__logo'}><img src={require('src/images/jumpstart/jumpstartlogo.png')} alt='jumpstart logo' /></div><HeroLoader /></>)
  } else {
    return (
      <>
        <div className={baseClass}>
          {isError ? (
            <GenericMessage type={GenericMessage.TYPES.ERROR}>
              We've encountered a problem.
              <p>Let's <button onClick={reset}>try again</button>.</p>
            </GenericMessage>
          ) : [PHASES.LOADING, PHASES.PROCESSING].indexOf(status) >= 0 ? (
            <ProcessingPage
              roomData={irisData || []}
              imageSrc={uploadedImage}
              isLoading={!irisSuccess && status === PHASES.LOADING}
              isProcessing={!irisSuccess && status === PHASES.PROCESSING}
              isProcessingDone={() => setProcessingDone(true)}
              onBeginInteraction={() => setCompletionBarriers(completionBarriers + 1)}
              onEndInteraction={() => setCompletionBarriers(completionBarriers - 1)} />
          ) : (PHASES.RESULTS === status) ? (
            <ResultsPage
              uploadedImage={uploadedImage}
              roomData={irisData}
              reset={reset}
              roomTypeProbabilities={roomTypeProbabilities.current} />
          ) : (PHASES.ERROR === status) ? (
            // TODO: make this real
            <p>There is a problem.</p>
          ) : (
            <MainPage onSelectFile={handleFileUpload} />
          )}
        </div>
      </>
    )
  }
}

export default facetBinder(JumpStartFacet, 'JumpStartFacet')
