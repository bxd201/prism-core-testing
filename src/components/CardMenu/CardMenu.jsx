// @flow
import * as React from 'react'
import './CardMenu.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import 'src/providers/fontawesome/fontawesome'
import { Link } from 'react-router-dom'

type CardMenuProps = {
  children: (setCardShowing: (React.Node) => void, setTitle: (string) => void) => React.Node,
  menuTitle?: string
}

/**
 * A Styled menu with a close button and an optional title. It's child render function has the option
 * of calling setCardShowing to replace the wrapped child content with a 'card'. It's child render function
 * also has to option of calling setTitle to replace the title with a dynamic title to represent the card
 * showing. CardMenu will display a back button while a card is showing which will return the component to
 * the original state when clicked.
 */
const CardMenu = ({ children, menuTitle = '' }: CardMenuProps) => {
  const [cardShowing: React.Node, setCardShowing: (React.Node) => void] = React.useState(null)
  const [cardTitle: string, setCardTitle] = React.useState(menuTitle)
  return (
    <div className='card-menu__wrapper'>
      <div className='card-menu__header'>
        <div className='card-menu__heading'>{cardTitle}</div>
        {cardShowing && <button className='card-menu__button card-menu__button--left' onClick={() => {
          setCardShowing(null)
          setCardTitle(menuTitle)
        }}>
          <div>
            <FontAwesomeIcon className={``} icon={['fa', 'angle-left']} />
            &nbsp;<span className='card-menu__button-left-text'>BACK</span>
          </div>
        </button>}
        <Link to={`/active`}>
          <button className='card-menu__button card-menu__button--right'>
            <div className='card-menu__close'>
              <span>CLOSE</span>&nbsp;<FontAwesomeIcon className={``} icon={['fa', 'chevron-up']} />
            </div>
            <div className='card-menu__cancel'>
              <FontAwesomeIcon className={``} icon={['fa', 'times']} />
            </div>
          </button>
        </Link>
      </div>
      <div className='card-menu__content'>
        {cardShowing || children(setCardShowing, setCardTitle)}
      </div>
    </div>
  )
}

export default CardMenu
