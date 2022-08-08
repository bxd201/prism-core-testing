// @flow
import React, { useContext } from 'react'
import { FormattedMessage } from 'react-intl'
import ConfigurationContext, {
  type ConfigurationContextType,
} from 'src/contexts/ConfigurationContext/ConfigurationContext'
import { tabsContainer } from './constants'
import { getDataElement } from './utils'

type HelpItemHeaderProps = {
  onClick: Function,
  onKeyDown: Function,
  isActive: boolean,
  messageId: string,
}

const HelpItemHeader = ({
  onClick,
  onKeyDown,
  isActive,
  messageId,
}: HelpItemHeaderProps) => {
  const { cvw = {} }: ConfigurationContextType =
    useContext(ConfigurationContext)

  return (
    <li
      className={`${tabsContainer}__list__item ${
        isActive
          ? `${tabsContainer}__list__item--active`
          : `${tabsContainer}__list__item--inactive`
      }`}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      onKeyDown={onKeyDown}
      role="tab"
      tabIndex="0"
    >
      {cvw.help?.[getDataElement(messageId)]?.title ?? (
        <FormattedMessage id={messageId} />
      )}
    </li>
  )
}

export default HelpItemHeader
