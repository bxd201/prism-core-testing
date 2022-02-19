// @flow
// This component takes scene objects and loads the blob image
import React, { useEffect, useState } from 'react'
import {
  SYSTEM_ERROR, updateVariantsCollectionSurfaces
} from '../../store/actions/loadScenes'
import * as axios from 'axios'
import flattenDeep from 'lodash/flattenDeep'
import type { FlatScene, FlatVariant } from '../../shared/types/Scene'

type SceneBlobLoaderProps = {
  scenes: FlatScene[],
  variants: FlatVariant[],
  initHandler?: Function,
  handleBlobsLoaded: Function,
  handleError: Function
}

const SceneBlobLoader = (props: SceneBlobLoaderProps) => {
  const { scenes, variants, initHandler, handleBlobsLoaded, handleError } = props
  const [blobUrls, setBlobUrls] = useState(null)

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
              err: 'Blob url not created error'
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
      const variantsCollection = updateVariantsCollectionSurfaces(variants, blobUrls, 'surfaceBlobUrl')
      handleBlobsLoaded(variantsCollection)
    }
  }, [blobUrls])

  return (<></>)
}

export default SceneBlobLoader
