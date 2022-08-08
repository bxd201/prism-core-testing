// @flow
import React, { forwardRef, useContext } from 'react'
import type { AbstractComponent } from 'react'
import { getDataElement } from './utils'
import { FormattedMessage } from 'react-intl'
import {
  contentDetails,
  contentHeader,
  helpContent,
  helpContentHide,
  subContent,
  subContentDetails,
  subContentHeader,
} from './constants'
import ConfigurationContext, {
  type ConfigurationContextType,
} from 'src/contexts/ConfigurationContext/ConfigurationContext'
import HelpIcons from './HelpIcons.jsx'
import HelpImageList from './HelpImageList'
import HelpImageListMobile from './HelpImageListMobile'

type HelpItemContentProps = {
  data: Object,
}

export const HelpItemContent: AbstractComponent<
  HelpItemContentProps,
  HTMLDivElement
> = forwardRef((props: HelpItemContentProps, ref) => {
  const { data } = props
  const { cvw = {} }: ConfigurationContextType =
    useContext(ConfigurationContext)
  const { help = {} } = cvw

  const tabContent = data.content
  const imageList = data.imageList
  const tabSubContent = data.subContent
  const imageListMobile = data.imageListMobile

  return (
    <div
      ref={ref}
      className={`${helpContent} ${data.isHiddenMobile ? helpContentHide : ''}`}
    >
      <div className={`${contentHeader}`}>
        <h2>
          {help[getDataElement(data.header)]?.title ?? (
            <FormattedMessage id={`${data.header}`} />
          )}
        </h2>
        <span>
          {help[getDataElement(data.subHeader)]?.subtitle ?? (
            <FormattedMessage id={`${data.subHeader}`} />
          )}
        </span>
      </div>
      <div className={`${contentDetails}`}>
        {tabContent ? (
          <HelpIcons data={data} />
        ) : imageList ? (
          <HelpImageList />
        ) : (
          ''
        )}
        {imageListMobile && <HelpImageListMobile />}
      </div>
      {tabSubContent &&
        tabSubContent.map((content, index) => {
          return (
            <div key={`tabSubContent-${index}`} className={`${subContent}`}>
              <div className={`${subContentHeader}`}>
                <FormattedMessage id={`${content.header}`} />
              </div>
              <p className={`${subContentDetails}`}>
                <FormattedMessage id={`${content.content}`} />
              </p>
            </div>
          )
        })}
    </div>
  )
})

export default HelpItemContent
