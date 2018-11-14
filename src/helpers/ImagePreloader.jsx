/* globals Image */
// @flow
import React, { PureComponent } from 'react'
import _ from 'lodash'

type Props = {
  // $FlowIgnore
  el: React$ElementClass,
  preload: Array<string | Array<string | Array<string>>>
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

  static makePromise = function (path: string): Promise<any> {
    const existingPromise = ImagePreloader.getPromise(path)

    if (existingPromise) {
      return existingPromise
    }

    const newPromise = new Promise((resolve: Function, reject: Function) => {
      let img = new Image()
      img.onload = () => { resolve(path) }
      img.onerror = (err: any) => { reject(err) }
      img.src = path
    })

    ImagePreloader.promiseMap[path] = newPromise

    return newPromise
  }

  constructor (props: Props) {
    super(props)

    const { preload } = this.props

    if (!_.isEmpty(preload)) {
      const flatPreload = _.flattenDeep(preload).filter(val => !!val)

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

    // $FlowIgnore
    return React.createElement(el, Object.assign({}, other, { error: error, loading: loading }))
  }
}

export default ImagePreloader