// @flow
import React from 'react'
import { useIntl } from 'react-intl'
import './FurnitureDetail.scss'

const baseClass = 'FurnitureDetail'

type FurnitureDetailProps = {
    furnitureInfo?: Array
  }

export const FurnitureDetail = (props: FurnitureDetailProps) => {
  const intl = useIntl()
  console.log(props.furnitureInfo)
  return (
    <>
      {
        props.furnitureInfo && props.furnitureInfo.map((info, key) => {
          return (
            <div key={key} className={`${baseClass}`}>
              <div className={`${baseClass}__title`}> {`${intl.formatMessage({ id: 'FURNITURE_NAME' }, { furnitureName: info.label })}`}</div>
              <hr className={`${baseClass}__line`} />
              <div className={`${baseClass}__content-container`}>
                <div className={`${baseClass}__content-container__image`}>
                  <img src={info.img} alt={intl.formatMessage({ id: 'FURNITURE_IMAGE' }, { furnitureName: info.label })} />
                </div>
                <div className={`${baseClass}__content-container__color`}>
                  {info.relevantColorGroup && info.relevantColorGroup.map((colorInfo, idx) => {
                    return (
                      <div className={`${baseClass}__content-container__color__wrapper`} key={idx}>
                        <div className={`${baseClass}__content-container__color__wrapper__palette`} style={{ background: colorInfo.hex }} />
                        <div className={`${baseClass}__content-container__color__wrapper__name`}><span>{colorInfo.brandKey} {colorInfo.colorNumber} </span><span>{colorInfo.name}</span></div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })
      }
    </>
  )
}
