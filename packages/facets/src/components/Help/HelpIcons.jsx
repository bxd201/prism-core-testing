// @flow

import React, { useContext } from 'react'
import { FormattedMessage } from 'react-intl'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Iconography from '../Iconography/Iconography'
import {
  helpIcons,
  iconInfo,
  iconWrap,
  iconWrapUndoRedo,
  secondIcon,
} from './constants'
import { getDataElement } from './utils'
import ConfigurationContext, {
  type ConfigurationContextType,
} from 'src/contexts/ConfigurationContext/ConfigurationContext'
import './Help.scss'
import '../SingleTintableSceneView/SceneSelectorNavButton.scss'
import type { Node } from 'react'

type HelpIconsProps = {
  data: Object,
}

const HelpIcons = ({ data }: HelpIconsProps): Node => {
  const { cvw = {} }: ConfigurationContextType =
    useContext(ConfigurationContext)
  const { help = {} } = cvw
  const tabContent = data.content

  return (
    <ul className={`${helpIcons}`}>
      {tabContent &&
        tabContent.map((tab: Object, index: number) => {
          const iconProps = {}
          if (!Array.isArray(tab.fontAwesomeIcon) && tab.fontAwesomeIcon.flip) {
            iconProps.flip = tab.fontAwesomeIcon.flip
          }
          if (!Array.isArray(tab.fontAwesomeIcon) && tab.fontAwesomeIcon.size) {
            iconProps.size = `${tab.fontAwesomeIcon.size}`
          }
          const sectionItem =
            help[getDataElement(data.header)]?.[
              getDataElement(tab.iconInfoName)
            ]
          return (
            (tab.iconInfoContent[0] || sectionItem) && (
              <li key={`li-${index}`}>
                <div
                  className={`${iconWrap} ${
                    tab.isUndoRedo ? `${iconWrapUndoRedo}` : ``
                  }`}
                >
                  {Array.isArray(tab.fontAwesomeIcon) ? (
                    tab.fontAwesomeIcon.map((fontIcon, index) => {
                      if (fontIcon.flip) {
                        iconProps.flip = fontIcon.flip
                      }
                      if (fontIcon.size) {
                        iconProps.size = `${fontIcon.size}`
                      }
                      return sectionItem?.icon ? (
                        <Iconography
                          name={sectionItem?.icon}
                          index={index}
                          key={`icon-${index}`}
                        />
                      ) : (
                        <FontAwesomeIcon
                          key={`icon-${index}`}
                          className={`${
                            index > 0 && !tab.isUndoRedo ? secondIcon : ``
                          }`}
                          icon={[fontIcon.variant, fontIcon.icon]}
                          size="lg"
                          transform={
                            fontIcon.rotate ? { rotate: fontIcon.rotate } : {}
                          }
                          {...iconProps}
                        />
                      )
                    })
                  ) : sectionItem?.icon ? (
                    <Iconography
                      name={sectionItem?.icon}
                      style={{
                        position: 'relative',
                        float: 'left',
                        backgroundColor: 'white',
                      }}
                    />
                  ) : (
                    <FontAwesomeIcon
                      className={``}
                      icon={[
                        tab.fontAwesomeIcon.variant,
                        tab.fontAwesomeIcon.icon,
                      ]}
                      size="lg"
                      transform={
                        tab.fontAwesomeIcon.rotate
                          ? { rotate: tab.fontAwesomeIcon.rotate }
                          : {}
                      }
                      {...iconProps}
                    />
                  )}
                </div>
                <div className={`${iconInfo}`}>
                  <h3>
                    {sectionItem?.title ?? (
                      <FormattedMessage id={`${tab.iconInfoName}`} />
                    )}
                  </h3>
                  <p>
                    {sectionItem?.content ?? (
                      <FormattedMessage id={`${tab.iconInfoContent[0]}`} />
                    )}
                  </p>
                </div>
              </li>
            )
          )
        })}
    </ul>
  )
}

export default HelpIcons
