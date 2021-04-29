// @flow
// This component takes scene objects and loads the blob image
import React, { useEffect, useState } from 'react'
import ImageQueue from '../MergeCanvas/ImageQueue'
import {
  SYSTEM_ERROR, updateVariantsCollectionSurfaces
} from '../../store/actions/loadScenes'
import * as axios from 'axios'
import flattenDeep from 'lodash/flattenDeep'
import type { FlatScene, FlatVariant } from '../../shared/types/Scene'

type SceneBlobLoaderProps = {
  // @todo update this to be typed to the new scene structure
  scenes: FlatScene[],
  variants: FlatVariant[],
  initHandler?: Function,
  handleBlobsLoaded: Function,
  handleError: Function
}

const SceneBlobLoader = (props: SceneBlobLoaderProps) => {
  const { scenes, variants, initHandler, handleBlobsLoaded, handleError } = props
  const [blobUrls, setBlobUrls] = useState(null)
  const [loadCounter, setLoadCounter] = useState([])

  useEffect(() => {
    initHandler()
  }, [])

  useEffect(() => {
    if (scenes.length && !blobUrls) {
      let surfaces = variants.map(variant => variant.surfaces.map(surface => surface.mask))

      surfaces = flattenDeep(surfaces, 2)
      const blobPromises = surfaces.map((surface, i) => {
        return axios.get(surface, {
          responseType: 'blob'
        })
      })

      Promise.all(blobPromises)
        .then((resp) => {
          try {
            const _blobUrls = resp.map(r => URL.createObjectURL(r.data))
            setBlobUrls(_blobUrls)
          } catch {
            handleError({
              type: SYSTEM_ERROR,
              err: `Blob url not creation error`
            })
          }
        })
        .catch((err) => {
          handleError({
            type: SYSTEM_ERROR,
            err
          })
        })
    }
  }, [scenes, variants, blobUrls])

  useEffect(() => {
    if (blobUrls?.length) {
      if (loadCounter.length === blobUrls.length) {
        console.warn('Use event DOM references safely in the handleBlobsLoaded callback of SceneBlobLoader, do not hold on to them.')
        const variantsCollection = updateVariantsCollectionSurfaces(variants, blobUrls, 'surfaceBlobUrl')
        handleBlobsLoaded(variantsCollection)
      }
    }
  }, [blobUrls, loadCounter])

  // The index returned is the position of the original url, so that loaded urls can vbe organized irrespective of load order
  const loadImageAsBlobUrl = (e: SyntheticEvent, i: number) => {
    setLoadCounter([...loadCounter, i])
  }

  return (blobUrls?.length && blobUrls.length !== variants.length ? <ImageQueue dataUrls={blobUrls} addToQueue={loadImageAsBlobUrl} /> : null)
}

export default SceneBlobLoader
