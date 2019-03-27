// @flow
import React, { PureComponent } from 'react'
import isEmpty from 'lodash/isEmpty'
import flattenDeep from 'lodash/flattenDeep'

import { ensureFullyQualifiedAssetUrl } from '../shared/helpers/DataUtils'
import { type NestedArray } from '../shared/types/Common'

type Props = {
  // $FlowIgnore
  el: React$ElementClass,
  preload: NestedArray<string | void>
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

  static getPromise = function (path: string): ?Promise<any> {
    if (ImagePreloader.promiseMap[path]) {
      return ImagePreloader.promiseMap[path]
    }

    return void (0)
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
    // never check if asset is newer -- always based on unique path
    img.validate = 'never'
    // set the source
    img.src = path
  }

  static makePromise = function (path: string): Promise<any> {
    const existingPromise = ImagePreloader.getPromise(ensureFullyQualifiedAssetUrl(path))

    if (existingPromise) {
      return existingPromise
    }

    const newPromise = new Promise((resolve: Function, reject: Function) => {
      const fullPath = ensureFullyQualifiedAssetUrl(path)
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

    ImagePreloader.promiseMap[path] = newPromise

    return newPromise
  }

  constructor (props: Props) {
    super(props)

    const { preload } = this.props

    if (!isEmpty(preload)) {
      const flatPreload = flattenDeep(preload).filter(val => !!val)

      if (flatPreload.length) {
        Promise.all(flatPreload.map(src => ImagePreloader.makePromise(src))).then((response: any) => {
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
    const { el, ...other } = this.props
    const { error, loading } = this.state

    return React.createElement(el, Object.assign({}, other, { error: error, loading: loading }))
  }
}

export default ImagePreloader
