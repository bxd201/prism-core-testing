// @flow
import React, { useContext, useState, useEffect } from 'react'
import { ColorWallPropsContext, ColorWallStructuralPropsContext } from '../ColorWallPropsContext'
import { computeChunk } from '../sharedReducersAndComputers'
import Prism, { ColorSwatch } from '@prism/toolkit'
import ConfigurationContext, { type ConfigurationContextType } from 'src/contexts/ConfigurationContext/ConfigurationContext'
import {
  cleanColorNameForURL,
  fullColorName, generateColorDetailsPageUrl
} from 'src/shared/helpers/ColorUtils'
import * as GA from 'src/analytics/GoogleAnalytics'
import { GA_TRACKER_NAME_BRAND, HASH_CATEGORIES } from 'src/constants/globals'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import at from 'lodash/at'
import ColorWallContext from '../../ColorWallContext'
import { useIntl } from 'react-intl'
import { useDispatch, useSelector } from 'react-redux'
import { emitColor } from '../../../../../store/actions/loadColors'
import { add } from '../../../../../store/actions/live-palette'
import startCase from 'lodash/startCase'
import InfoButton from '../../../../InfoButton/InfoButton'
import { Link } from 'react-router-dom'

const swatchClass = 'cwv3__swatch'

type SwatchProps = {
  active: any,
  houseShaped: any,
  color: any,
  data: {
    children: any,
    titles: any,
    props: any,
    childProps: any
  },
  id: string,
  onRef: any
}

type SwatchContentProps = {
  color: any,
  style?: {}
}

const SwatchContent = ({ color, style }: SwatchContentProps) => {
  const dispatch = useDispatch()
  const { messages = {} } = useIntl()

  const { addButtonText, displayAddButton, displayInfoButton, displayDetailsLink, colorDetailPageRoot }: ColorWallContextProps = useContext(ColorWallContext)
  const { brandId, brandKeyNumberSeparator, swatchShouldEmit }: ConfigurationContextType = useContext(ConfigurationContext)

  const colorIsInLivePalette: boolean = useSelector(store => store.lp.colors.some(({ colorNumber }) => colorNumber === color.colorNumber))
  const title = (addButtonText || at(messages, 'ADD_TO_PALETTE')[0] || '').replace('{name}', fullColorName(color.brandKey, color.colorNumber, color.name, brandKeyNumberSeparator))

  return (
    <div className='swatch-content-size'>
      <div className='swatch-content__btns'>
        <div className='swatch-content__button-group swatch-content__button-group--xs' style={style}>
          {displayAddButton &&
            (colorIsInLivePalette
              ? (<FontAwesomeIcon className='check-icon' icon={['fa', 'check-circle']} size='2x' />)
              : (
                <button
                  title={title}
                  onClick={() => {
                    dispatch(swatchShouldEmit ? emitColor(color) : add(color))
                    GA.event({
                      category: startCase(window.location.hash.split('/').filter(hash => HASH_CATEGORIES.indexOf(hash) >= 0)),
                      action: 'Color Swatch Add',
                      label: fullColorName(color.brandKey, color.colorNumber, color.name, brandKeyNumberSeparator)
                    }, GA_TRACKER_NAME_BRAND[brandId])
                  }}
                >
                  <FontAwesomeIcon className='add-icon' icon={['fal', 'plus-circle']} size='2x' />
                  {addButtonText && <span className='OmniButton__content'>{title}</span>}
                </button>
              )
            )
          }
          {displayInfoButton && <InfoButton color={color} />}
          {displayDetailsLink && (
            colorDetailPageRoot
              ? (
                <a
                  href={`${colorDetailPageRoot}/${color.brandKey}${color.colorNumber}-${cleanColorNameForURL(color.name)}`}
                  title={(at(messages, 'VIEW_DETAILS_FOR')[0] || '').replace('{name}', fullColorName(color.brandKey, color.colorNumber, color.name, brandKeyNumberSeparator))}
                  className='OmniButton color-swatch__content__cta color-swatch__content__cta--l'
                >
                  {at(messages, 'VIEW_DETAILS')[0]}
                </a>
              )
              : (
                <Link
                  to={generateColorDetailsPageUrl(color)}
                  title={(at(messages, 'VIEW_DETAILS_FOR')[0] || '').replace('{name}', fullColorName(color))}
                  className='OmniButton color-swatch__content__cta color-swatch__content__cta--l'
                >
                  {at(messages, 'VIEW_DETAILS')[0]}
                </Link>
              )
          )}
        </div>
      </div>
      <div className='swatch-content__label swatch-content__number-name'>
        <p className='swatch-content__label--number'>{`${color.brandKey} ${color.colorNumber}`}</p>
        <p className='swatch-content__label--name'>{color.name}</p></div>
    </div>
  )
}

function Swatch ({ data, id, active, houseShaped, color, onRef }: SwatchProps) {
  const ctx = useContext(ColorWallPropsContext)
  const structuralCtx = useContext(ColorWallStructuralPropsContext)
  const { brandId, brandKeyNumberSeparator }: ConfigurationContextType = useContext(ConfigurationContext)

  const { getPerimeterLevel, setActiveSwatchId, swatchContentRefs } = ctx
  const perimeterLevel = getPerimeterLevel(id)
  const [ swatchWidth, setSwatchWidth ] = useState(0)
  const [ swatchHeight, setSwatchHeight ] = useState(0)

  useEffect(() => {
    const results = computeChunk(data, structuralCtx)

    if (results) {
      const {
        swatchHeight,
        swatchWidth
      } = results

      setSwatchWidth(swatchWidth)
      setSwatchHeight(swatchHeight)
    }
  }, [data, structuralCtx])

  return (
    <Prism >
      <ColorSwatch
        active={active}
        activeFocus={!houseShaped}
        aria-label={fullColorName(color.brandKey, color.colorNumber, color.name, brandKeyNumberSeparator)}
        color={color}
        className={`${swatchClass}${active ? ` ${swatchClass}--active${houseShaped ? ` ${swatchClass}--house-shaped` : ''}` : ''}${perimeterLevel > 0 ? ` ${swatchClass}--perimeter ${swatchClass}--perimeter--${perimeterLevel}` : ''}`}
        id={id}
        onClick={() => {
          setActiveSwatchId(id)
          swatchContentRefs.current = []
          GA.event({ category: 'Color Wall', action: 'Color Swatch Click', label: fullColorName(color.brandKey, color.colorNumber, color.name, brandKeyNumberSeparator) }, GA_TRACKER_NAME_BRAND[brandId])
        }}
        ref={onRef}
        renderer={() => <SwatchContent color={color} />}
        style={{ height: swatchHeight, width: swatchWidth }}
      />
    </Prism>
  )
}

export default Swatch
