// @flow
import type { Node } from 'react'
import React, { useContext } from 'react'
import { useIntl } from 'react-intl'
import ConfigurationContext, {
  type ConfigurationContextType,
} from 'src/contexts/ConfigurationContext/ConfigurationContext'
import { helpImages } from './constants'

type HelpImageListProps = {
  data: Object[]
}

const HelpImageList = ({ data }: HelpImageListProps): Node => {
  const { cvw = {} }: ConfigurationContextType = useContext(ConfigurationContext)
  const { help = {} } = cvw
  const { formatMessage } = useIntl()
  const imageList = data

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
            {help[item.imagePathKey] ? (
              <img
                className={`${helpImages}__i`}
                src={help[item.imagePathKey]}
                alt={item.alt ? formatMessage({ id: item.alt }) : ''}
              />
            ) : null}
          </li>
        ))}
    </ul>
  )
}

export default HelpImageList
