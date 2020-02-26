// @flow
import React from 'react'
import { useDispatch } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import 'src/providers/fontawesome/fontawesome'
import { useIntl } from 'react-intl'

import './SaveOptions.scss'
import { showSaveSceneModal } from '../../store/actions/persistScene'

type SaveOptionsProps = {

}

const saveOptionsBaseClassName = 'save-options'
const saveOptionsItemsClassName = `${saveOptionsBaseClassName}__items`

const SaveOptions = (props: SaveOptionsProps) => {
  const intl = useIntl()
  const dispatch = useDispatch()

  const handleSave = (e: SyntheticEvent) => {
    e.preventDefault()
    dispatch(showSaveSceneModal(true))
  }

  const handleDownload = (e: SyntheticEvent) => {
    e.preventDefault()
    // @todo integrate downlaod -RS
    console.log('Downloading Scene...')
  }

  return (
    <div className={saveOptionsBaseClassName}>
      <button onClick={handleDownload}>
        <div className={saveOptionsItemsClassName}>
          <div>
            <FontAwesomeIcon
              title={intl.messages.DOWNLOAD_MASK}
              icon={['fal', 'download']}
              size='2x' />
          </div>
          <div>{intl.messages.DOWNLOAD_MASK}</div>
        </div>
      </button>
      <button onClick={handleSave}>
        <div className={saveOptionsItemsClassName}>
          <div>
            <FontAwesomeIcon
              title={intl.messages.SAVE_MASKS}
              icon={['fal', 'folder']}
              size='2x' />
          </div>
          <div>{intl.messages.SAVE_MASKS}</div>
        </div>
      </button>
    </div>
  )
}

export default SaveOptions
