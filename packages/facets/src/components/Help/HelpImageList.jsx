// @flow
import React, { useContext } from 'react'
import type { Node } from 'react'
import { FormattedMessage } from 'react-intl'
import { helpImages } from './constants'
import ConfigurationContext, {
  type ConfigurationContextType,
} from 'src/contexts/ConfigurationContext/ConfigurationContext'

type HelpImageListProps = {
  data: Object,
}

const HelpImageList = ({ data }: HelpImageListProps): Node => {
  const { cvw = {} }: ConfigurationContextType =
    useContext(ConfigurationContext)
  const { help = {} } = cvw
  const imageList = data.imageList

  return (
    <ul className={`${helpImages}`}>
      {imageList &&
        imageList.map((item, index) => (
          <li
            key={`li-${index}`}
            className={`${helpImages}__cell ${
              index > 0
                ? `${helpImages}__cell--overlay ${helpImages}__cell--${index}`
                : `${helpImages}__cell--base`
            }`}
          >
            {help ? (
              <img
                className={`${helpImages}__i`}
                src={help[item.imagePathKey]}
                alt={item.alt ? FormattedMessage({ id: item.alt }) : ''}
              />
            ) : null}
          </li>
        ))}
    </ul>
  )
}

export default HelpImageList
