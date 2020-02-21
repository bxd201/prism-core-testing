// @flow
import React, { PureComponent } from 'react'
import isEmpty from 'lodash/isEmpty'
import flattenDeep from 'lodash/flattenDeep'

import { ensureFullyQualifiedAssetUrl } from '../shared/helpers/DataUtils'
import { type NestedArray } from '../shared/types/Common.js.flow'
import MaskObj from '../store/masks/MaskObj'

type Props = {
  // $FlowIgnore
  el: React$ElementClass,
  preload: NestedArray<string | MaskObj | void>
}

type State = {
  error: boolean,
  loading: boolean
}

class ImagePreloader extends PureComponent<Props, State> {
  state: State = {
    error: false,
    loading: false
  }

  static promiseMap: {
    [ key: string ]: Promise<any>
  } = {}

  static getPromise = function (key: string): ?Promise<any> {
    return ImagePreloader.promiseMap[key]
  }

  static performDownload (path: string, resolve: {
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
        ImagePreloader.performDownload(path, resolve, reject, true)
      }, 10000)
    }

    // set the source
    img.src = path
  }

  static makePromise = function (tgt: string | MaskObj): Promise<any> | typeof undefined {
    let existingPromise

    if (tgt instanceof MaskObj) {
      existingPromise = ImagePreloader.getPromise(tgt.id)
    } else if (typeof tgt === 'string') {
      existingPromise = ImagePreloader.getPromise(ensureFullyQualifiedAssetUrl(tgt))
    }

    if (existingPromise) {
      return existingPromise
    }

    if (tgt instanceof MaskObj) {
      ImagePreloader.promiseMap[tgt.id] = tgt.loading
      return tgt.loading
    } else if (typeof tgt === 'string') {
      const newPromise = new Promise((resolve: Function, reject: Function) => {
        const fullPath = ensureFullyQualifiedAssetUrl(tgt)
        // non-blocking request, unlike setting Image source
        ImagePreloader.performDownload(
          fullPath,
          {
            using: resolve,
            with: fullPath
          }, {
            using: reject
          }
        )
      })

      ImagePreloader.promiseMap[tgt] = newPromise

      return newPromise
    }
  }

  constructor (props: Props) {
    super(props)

    const { preload } = this.props

    if (!isEmpty(preload)) {
      const flatPreload = flattenDeep(preload).filter(val => !!val)

      if (flatPreload.length) {
        Promise.all(flatPreload.map(tgt => ImagePreloader.makePromise(tgt))).then((response: any) => {
          this.setState({
            error: false,
            loading: false
          })
        }).catch((error: any) => {
          this.setState({
            error: true,
            loading: false
          })
          console.warn(error)
        })

        this.state.loading = true
      } else {
        this.state.error = false
        this.state.loading = false
      }
    }
  }

  render () {
    // remove el and preload because they are specific to ImagePreloader -- we'll pass the other props along
    const { el, preload, ...other } = this.props
    const { error, loading } = this.state

    return React.createElement(el, Object.assign({}, other, { error: error, loading: loading }))
  }
}

export default ImagePreloader
