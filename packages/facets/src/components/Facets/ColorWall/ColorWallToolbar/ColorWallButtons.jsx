// @flow
import React, { useContext } from 'react'
import type { Node } from 'react'
import { FormattedMessage } from 'react-intl'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { MODE_CLASS_NAMES } from '../shared'
import ConfigurationContext, {
  type ConfigurationContextType
} from 'src/contexts/ConfigurationContext/ConfigurationContext'
import ButtonBar from 'src/components/GeneralButtons/ButtonBar/ButtonBar'
import '../../../GeneralButtons/ButtonBar/ButtonBar.scss'

type SearchButtonProps = {
  to: string,
  children?: Node
}

export const SearchButton = ({ to, children }: SearchButtonProps): Node => {
  const { colorWall } = useContext<ConfigurationContextType>(ConfigurationContext)

  // Customized button with children
  if (children) {
    return <ButtonBar.Button to={to}>{children}</ButtonBar.Button>
  }

  // For CBG
  if (colorWall?.colorSwatch?.houseShaped) {
    return (
      <ButtonBar.Button to={to}>
        <span className={MODE_CLASS_NAMES.DESC}>
          {colorWall.searchColor ?? <FormattedMessage id='SEARCH.SEARCH_COLOR' />}
        </span>
        <FontAwesomeIcon className='color-families-svg' icon={['fa', 'search']} pull='left' />
      </ButtonBar.Button>
    )
  }

  // All the rest
  return (
    <ButtonBar.Button to={to}>
      <FontAwesomeIcon className='color-families-svg' icon={['fa', 'search']} pull='left' />
      <span className={MODE_CLASS_NAMES.DESC}>
        {colorWall.searchColor ?? <FormattedMessage id='SEARCH.SEARCH_COLOR' />}
      </span>
    </ButtonBar.Button>
  )
}
