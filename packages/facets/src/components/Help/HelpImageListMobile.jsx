// @flow
import React, { useContext } from 'react'
import { useIntl } from 'react-intl'
import ConfigurationContext, {
  type ConfigurationContextType,
} from 'src/contexts/ConfigurationContext/ConfigurationContext'
import { helpImages, helpImagesMobile } from './constants'
import type { Node } from 'react'

type HelpImageListMobileProps = {
  data?: Object[]
}

const HelpImageListMobile = ({ data }: HelpImageListMobileProps): Node => {
  const { cvw = {} }: ConfigurationContextType = useContext(ConfigurationContext)
  const { help = {} } = cvw
  const { formatMessage } = useIntl()
  const imageListMobile = data

  return (
    <ul className={`${helpImagesMobile}`}>
      {imageListMobile &&
        imageListMobile.map((item, index) => (
          <li
            key={`li-mobile-image-${index}`}
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
                alt={item.alt ? formatMessage({ id: item.alt }) : ''}
              />
            ) : null}
          </li>
        ))}
    </ul>
  )
}

export default HelpImageListMobile
