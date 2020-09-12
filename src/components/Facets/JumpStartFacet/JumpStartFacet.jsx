// @flow
import React, { useState, useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import facetBinder from 'src/facetSupport/facetBinder'
import MainPage from './components/MainPage/MainPage'
import ProcessingPage from './components/ProcessingPage/ProcessingPage'
import ResultsPage from './components/ResultsPage/ResultsPage'
import GenericMessage from 'src/components/Messages/GenericMessage'
import useDeepLabModel, { deepLabModels } from 'src/shared/hooks/useDeepLabModel'
import useDeepLabModelForSegmentation from 'src/shared/hooks/useDeepLabModelForSegmentation'

import { uploadImage } from 'src/store/actions/user-uploads'
import useEffectAfterMount from 'src/shared/hooks/useEffectAfterMount'

import './JumpStartFacet.scss'
import './JSFCommon.scss'

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
  const [uploadedImage, setUploadedImage] = useState()
  const { error: fmError } = useSelector(state => state.uploads)
  const [isError, setIsError] = useState(false)
  const [deeplabModel, , modelError] = useDeepLabModel(deepLabModels.ADE20K, 4)
  const [irisData, irisSuccess, irisError, , irisProcessing] = useDeepLabModelForSegmentation(deeplabModel, uploadedImage)
  const [completionBarriers, setCompletionBarriers] = useState(1) // default is ALWAYS 1

  const reset = () => {
    setIsError(false)
    setStatus(PHASES[PHASE_ORDER[0]])
    setCompletionBarriers(1)
  }

  const decrementCompletionBarriers = useCallback(() => {
    setCompletionBarriers(completionBarriers - 1)
  }, [completionBarriers])

  useEffectAfterMount(() => {
    if (completionBarriers === 0) {
      setStatus(PHASES.RESULTS)
    }
  }, [completionBarriers])

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
            isLoading={!irisSuccess && status === PHASES.LOADING}
            isProcessing={!irisSuccess && status === PHASES.PROCESSING}
            onBeginInteraction={() => setCompletionBarriers(completionBarriers + 1)}
            onEndInteraction={() => setCompletionBarriers(completionBarriers - 1)} />
        ) : (PHASES.RESULTS === status) ? (
          <ResultsPage roomData={irisData} />
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

export default facetBinder(JumpStartFacet, 'JumpStartFacet')
