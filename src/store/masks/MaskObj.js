// @flow
import axios from 'axios'
import { addListener } from '../../shared/helpers/MiscUtils'

export type MaskObjInput = {
  id: string,
  load?: string,
  blob?: Blob
}

export default class MaskObj {
  _loadingPromise: Promise<string>
  _isLoading: boolean = false
  _id: string
  _objectURL: string
  _blob: any
  _path: string
  _width: number
  _height: number

  // $FlowIgnore - enforce functionality of hasInstance through minification, but flow doesn't like it
  static [Symbol.hasInstance] (obj: MaskObj) {
    return obj.updateMask && obj.flush
  }

  constructor (props: MaskObjInput) {
    const { id, blob, load } = props
    const loadingPromise = new Promise((resolve, reject) => {
      if (blob) {
        resolve(this.updateMask(blob)._path)
      } else if (load) {
        // perform initial asset load
        const _this = this
        this._isLoading = true

        axios({
          method: 'get',
          url: load,
          responseType: 'blob'
        }).then(response => {
          const path = _this.updateMask(response.data)._path
          const img = new Image()
          const listeners = []
          const stopListening = () => listeners.map(l => l())

          listeners.push(addListener(img, 'load', (e) => {
            stopListening()
            resolve(_this.path)
            _this._width = img.naturalWidth
            _this._height = img.naturalHeight
          }))

          listeners.push(addListener(img, 'error', (err) => {
            stopListening()
            reject(err)
          }))

          img.src = path
        }).catch(err => {
          reject(err)
        })
      }
    })

    this._loadingPromise = loadingPromise
    this._id = id
  }

  // ----------- GETTERS ---------------

  get id () {
    return this._id
  }

  get path () {
    return this._path
  }

  get imageData (): Promise<Uint8Array> | typeof undefined {
    // returns promise that provides array buffer data
    return this._loadingPromise.then(() => new Promise((resolve, reject) => {
      const blob = this._blob
      // if no longer loading but we do not have a blob...
      if (!blob) {
      // if (!blob) {
        // ... there's an issue!
        reject(new Error(`No blob present in ${this._id}`))
        return
      }

      const fileReader = new FileReader()
      const listeners = []
      const stopListening = () => listeners.map(l => l())

      listeners.push(addListener(fileReader, 'load', event => {
        stopListening()
        resolve(new Uint8Array(event.target.result))
      }))

      listeners.push(addListener(fileReader, 'error', err => {
        fileReader.abort()
        stopListening()
        reject(err)
      }))

      fileReader.readAsArrayBuffer(blob)
    }))
  }

  get loading () {
    return this._loadingPromise
  }

  get width () {
    return this._width
  }

  get height () {
    return this._height
  }

  // ----------- PUBLIC METHODS ---------------

  updateMask (blob: Blob): MaskObj {
    this.flush()
    this._blob = blob

    try {
      this._path = URL.createObjectURL(blob)
    } catch (err) {
      console.error(err)
    }

    return this
  }

  flush () {
    if (this._objectURL) {
      URL.revokeObjectURL(this._objectURL)
    }
  }
}
