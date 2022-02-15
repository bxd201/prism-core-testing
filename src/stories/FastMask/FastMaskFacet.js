import { createPrismEmbedScript } from '../shared/utils'

export function createFastMaskFacet ({ groupNames, forceSquare, showLoader, sceneName, defaultImage, defaultMask, maxSceneHeight, uploadButtonText, color, prismVersion }) {
  function embedPrism () {
    const embedTarget = document.getElementById('prism-embed-root')
    window.PRISM.embed(embedTarget, {
      bindCallback: ({ publish, subscribe }) => {
        subscribe('SV_ERROR', (err) => {
          console.table(err)
          window.alert('An Error occurred.')
        })
        subscribe('SV_TRIGGER_IMAGE_UPLOAD', data => {
          // the data payload has an id it can be used to track who needs to responded to the triggering call. Think of these like PIDs
          const userInput = window.prompt('Enter yes to upload an image, enter no to cancel', 'yes')
          if (userInput?.toLowerCase().trim()[0] === 'y') {
            const uploadElement = document.createElement('input')
            uploadElement.type = 'file'
            uploadElement.addEventListener('change', e => {
              publish('SV_NEW_IMAGE_UPLOAD', { eventId: data.eventId, data: e.target.files[0] })
            })
            // programmatically triggering a file dialog is a bit of a hack.  This works bc the browser tracks that this is triggered from a human initiated event.
            // However, a log press on a prompt ok button seems like it prevents the browser from associating the the click to the invoked one.
            // We should really design UX around a click directly opening a dialog
            uploadElement.click()
          } else {
            publish('SV_NEW_IMAGE_UPLOAD', { eventId: data.eventId, data: null })
          }
        })
        // An example binding pub/sub to the plain DOM. These methods are only exposed in this callback
        // const simBtn = document.querySelector('#sim_btn')
        // simBtn.addEventListener('click', () => {
        // })
        // represents colors changing from elsewhere in on the page
        const colorSelect = document.querySelector('#color_select')
        colorSelect?.addEventListener('change', e => { // eslint-disable-line
          // using timestamp is ok for prism template and also since this is invoked by user input and not programmatically
          publish('SV_COLOR_UPDATE', { eventId: `tsv_event_id_${Date.now()}`, data: e.target.value })
        })
      }
    })
  }

  const wrapper = document.createElement('div')
  const div = document.createElement('div')
  div.id = 'prism-embed-root'
  div.setAttribute('data-prism-facet', 'SceneVisualizerFacet')
  div.setAttribute('data-group-names', groupNames)
  div.setAttribute('data-force-square', forceSquare)
  div.setAttribute('data-page-root', '/sv')
  div.setAttribute('data-show-loader', showLoader)
  div.setAttribute('data-default-color', color)
  div.setAttribute('data-scene-name', sceneName)
  div.setAttribute('data-default-image', defaultImage)
  div.setAttribute('data-default-mask', defaultMask)
  div.setAttribute('data-max-scene-height', maxSceneHeight)
  div.setAttribute('data-upload-button-text', uploadButtonText)

  const script = createPrismEmbedScript(embedPrism, prismVersion)

  wrapper.appendChild(div)
  wrapper.appendChild(script)

  return wrapper
}
