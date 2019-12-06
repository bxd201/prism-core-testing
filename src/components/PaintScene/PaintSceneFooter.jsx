// @flow
import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import 'src/providers/fontawesome/fontawesome'
import { useIntl } from 'react-intl'

import './PaintScene.scss'

const baseClass = 'paint__scene__wrapper'
const footerClass = `${baseClass}__paintscene-footer`

type PaintSceneFooterProps = {
  handleSave: Function
}
const PaintSceneFooter = (props: PaintSceneFooterProps) => {
  const intl = useIntl()

  return (
    <div className={footerClass}>
      <button onClick={props.handleSave}>
        <FontAwesomeIcon
          title={intl.messages.SAVE_MASKS}
          icon={['fal', 'folder']}
          size='lg' />
      </button>
    </div>
  )
}

export default PaintSceneFooter
