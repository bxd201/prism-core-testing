// @flow
import React, { type Node, useContext, useState } from 'react'
import './CardMenu.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import 'src/providers/fontawesome/fontawesome'
import { useHistory } from 'react-router-dom'
import { FormattedMessage } from 'react-intl'
import ConfigurationContext, { type ConfigurationContextType } from '../../contexts/ConfigurationContext/ConfigurationContext'

type CardMenuProps = {
  children: (setCardShowing: (Node) => void, setTitle: (string) => void) => Node,
  menuTitle?: string,
  showBackByDefault?: boolean,
  backPath?: string
}

/**
 * A Styled menu with a close button and an optional title. It's child render function has the option
 * of calling setCardShowing to replace the wrapped child content with a 'card'. It's child render function
 * also has the option of calling setTitle to replace the title with a dynamic title to represent the card
 * showing. CardMenu will display a back button while a card is showing which will return the component to
 * the original state when clicked.
 */
const CardMenu = ({ children, menuTitle = '', showBackByDefault = false, backPath = '' }: CardMenuProps) => {
  const [cardShowing: Node, setCardShowing: (Node) => void] = useState(null)
  const [cardTitle: string, setCardTitle] = useState(menuTitle)
  const history = useHistory()
  const { cvw = {} } = useContext<ConfigurationContextType>(ConfigurationContext)

  return (
    <div className='card-menu__wrapper'>
      <div className='card-menu__header'>
        <div className='card-menu__heading'>{cardTitle}</div>
        {(cardShowing || showBackByDefault) && <button className='card-menu__button card-menu__button--left' onClick={() => {
          setCardShowing(null)
          setCardTitle(menuTitle)
          if (showBackByDefault && !cardShowing) backPath && history.push(backPath)
        }}>
          <div>
            <FontAwesomeIcon size='lg' className={``} icon={['fa', 'angle-left']} />
            &nbsp;<span className='card-menu__button-left-text'><FormattedMessage id='BACK' /></span>
          </div>
        </button>}
        <button className='card-menu__button card-menu__button--right' onClick={() => history.push('/active')}>
          <div className='card-menu__close'>
            {cvw.closeBtn ?? <FormattedMessage id='CLOSE' />}&nbsp;&nbsp;<FontAwesomeIcon className={``} icon={['fa', 'chevron-up']} />
          </div>
          <div className='card-menu__cancel'>
            <FontAwesomeIcon size='lg' icon={['fa', 'times']} />
          </div>
        </button>
      </div>
      <div className='card-menu__content'>
        {cardShowing || children(setCardShowing, setCardTitle)}
      </div>
    </div>
  )
}

export default CardMenu
