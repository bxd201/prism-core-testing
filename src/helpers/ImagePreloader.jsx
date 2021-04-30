/* @todo deprecated -RS */
// @flow
import { useState, useEffect } from 'react'
import isEmpty from 'lodash/isEmpty'
import flattenDeep from 'lodash/flattenDeep'

import ensureFullyQualifiedAssetUrl from 'src/shared/utils/ensureFullyQualifiedAssetUrl.util'
import { type NestedArray } from '../shared/types/Common.js.flow'
import MaskObj from '../store/masks/MaskObj'

type Props = {
  children: Function => any,
  preload: NestedArray<string | MaskObj | void>
}

const promiseMap: {
  [ key: string ]: Promise<any>
} = {}

const ImagePreloader = (props: Props) => {
  const { children, preload } = props

  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    //* https://reactjs.org/docs/hooks-effect.html#effects-with-cleanup/
    let cancelSubscription = false
    if (!isEmpty(preload)) {
      const flatPreload = flattenDeep(preload).filter(val => !!val)
      if (flatPreload.length) {
        Promise.all(flatPreload.map(tgt => makePromise(tgt))).then((response: any) => {
          if (!cancelSubscription) {
            setError(false)
            setLoading(false)
          }
        }).catch((error: any) => {
          if (!cancelSubscription) {
            setError(true)
            setLoading(false)
            console.warn(error)
          }
        })

        setLoading(true)
      } else {
        setLoading(false)
        setError(false)
      }
    }
    return () => { cancelSubscription = true }
  }, [preload])

  return children({ error, loading })
}

// -----------------------------------------------
// IMAGE DOWNLOAD MANAGEMENT FUNCTIONS
// -----------------------------------------------

function getPromise (key: string): ?Promise<any> {
  return promiseMap[key]
}

function performDownload (path: string, resolve: {
  using: Function,
  with?: any
}, reject: {
  using: Function
}, final: boolean = false) {
  var img = new Image()

  img.onload = () => {
    resolve.using(resolve.with)
  }

  img.onerror = (err) => {
    if (final) {
      console.info(`Failed to download ${path}. No more retries available. Error reference:`, err)
      reject.using(err)
      return false
    }

    console.info(`Failed to download ${path}. Retrying download. Error reference:`, err)
    setTimeout(() => {
      performDownload(path, resolve, reject, true)
    }, 10000)
  }

  // set the source
  img.crossOrigin = 'Anonymous'
  img.src = path
}

function makePromise (tgt: string | MaskObj): Promise<any> | typeof undefined {
  let existingPromise

  if (tgt instanceof MaskObj) {
    existingPromise = getPromise(tgt.id)
  } else if (typeof tgt === 'string') {
    existingPromise = getPromise(ensureFullyQualifiedAssetUrl(tgt))
  }

  if (existingPromise) {
    return existingPromise
  }

  if (tgt instanceof MaskObj) {
    promiseMap[tgt.id] = tgt.loading
    return tgt.loading
  } else if (typeof tgt === 'string') {
    const newPromise = new Promise((resolve: Function, reject: Function) => {
      const fullPath = ensureFullyQualifiedAssetUrl(tgt)
      // non-blocking request, unlike setting Image source
      performDownload(
        fullPath,
        {
          using: resolve,
          with: fullPath
        }, {
          using: reject
        }
      )
    })

    promiseMap[tgt] = newPromise

    return newPromise
  }
}

export default ImagePreloader
