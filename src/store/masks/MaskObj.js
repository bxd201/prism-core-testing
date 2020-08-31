// @flow
import axios from 'axios'
import { addListener } from '../../shared/helpers/MiscUtils'
import FileReader2 from 'src/shared/utils/FileReader2.util'

export type MaskObjInput = {
  id: string,
  load?: string,
  blob?: Blob
}

export default class MaskObj {
  _loadingPromise: Promise<string>
  _id: string
  _objectURL: string
  _blob: any
  _path: string
  _width: number
  _height: number
  _load: string

  // $FlowIgnore - enforce functionality of hasInstance through minification, but flow doesn't like it
  static [Symbol.hasInstance] (obj: MaskObj) {
    return obj.updateMask && obj.flush
  }

  constructor (props: MaskObjInput) {
    if (!props) {
      throw new Error('MaskObj cannot be instantiated without props.')
    }

    const { id, blob, load } = props

    if (!id) {
      throw new Error('MaskObj cannot be instantiated without id.')
    }

    if ((!blob || !(blob instanceof Blob)) && !load) {
      throw new Error('MaskObj cannot be instantiated without valid load or blob.')
    }

    const loadingPromise = new Promise((resolve, reject) => {
      if (blob) {
        resolve(this.updateMask(blob)._path)
      } else if (load) {
        // perform initial asset load
        const _this = this

        axios.get(load, {
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
            _this._load = load
          }))

          listeners.push(addListener(img, 'error', (err) => {
            stopListening()
            reject(err)
          }))

          img.src = path
        }).catch(err => {
          reject(err)
        })
      } else {
        reject(new Error('Cannot load or process provided load or blob data'))
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

  get load () {
    return this._load
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

      new FileReader2().readAsArrayBuffer(blob)
        .then(data => resolve(new Uint8Array(data)))
        .catch(() => reject(new Error(`Unable to read blob as array buffer in ${this._id}`)))
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
