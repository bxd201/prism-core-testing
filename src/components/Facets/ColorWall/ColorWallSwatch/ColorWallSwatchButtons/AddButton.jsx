// @flow
import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import 'src/providers/fontawesome/fontawesome'

type Props = {
  config: Object,
  onClick: Function
}

const AddButton = (props: Props) => {
  const {
    config,
    onClick,
    ...other
  } = props

  if (config.displayAddButton) {
    return (
      <button onClick={onClick} {...other}>
        <FontAwesomeIcon icon={['fa', 'plus']} size='1x' />
      </button>
    )
  }

  return null
}

export default React.memo<Props>(AddButton)
