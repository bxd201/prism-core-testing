import { addListener } from 'src/shared/helpers/MiscUtils'

function FileReader2 () {
  this.readAsArrayBuffer = (blob) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader()
      const listeners = []
      const stopListening = () => listeners.map(l => l())

      addListener(fileReader, 'load', (event) => {
        stopListening()
        resolve(event.target.result)
      })

      addListener(fileReader, 'error', (err) => {
        stopListening()
        reject(err)
        fileReader.abort()
      })

      fileReader.readAsArrayBuffer(blob)
    })
  }
}

export default FileReader2
