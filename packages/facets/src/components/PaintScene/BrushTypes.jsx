// @flow
import React from 'react'
import { useIntl } from 'react-intl'
import { brushLargeSize, brushMediumSize, brushRoundShape, brushShapesTypes,brushSmallSize, brushTinySize } from './data'
import RadioButton from './RadioButton'
import './BrushTypes.scss'

const baseClass = 'brush-types'
const wrapperClass = `${baseClass}__wrapper`
const shapesContainerClass = `${baseClass}__shapes-container`
const brushButtonClass = `${baseClass}__brush-button`
const brushButtonCircleClass = `${brushButtonClass}--circle`
const brushButtonLargeClass = `${brushButtonClass}--large`
const brushButtonMediumClass = `${brushButtonClass}--medium`
const brushButtonSmallClass = `${brushButtonClass}--small`
const brushButtonTinyClass = `${brushButtonClass}--tiny`
const brushButtonActiveClass = `${brushButtonClass}--active`
const ARIA_LABEL = 'PAINT_TOOLS.ICON_SELECTED_INFO'

type Props = {
  activeWidth: number,
  activeShape: string,
  setBrushShapeSize: Function,
  brushTypeName: string
}

export function BrushTypes ({ activeWidth, activeShape, setBrushShapeSize, brushTypeName }: Props) {
  const intl = useIntl()
  const brushTypesRefs = brushShapesTypes.reduce((acc, value) => {
    acc[value.id] = React.createRef()
    return acc
  }, {})

  const enableBrushType = (isNext: boolean, ref: Object) => {
    if (isNext) {
      if (ref.current === brushTypesRefs[7].current) {
        brushTypesRefs[0].current.focus()
        brushTypesRefs[0].current.click()
      } else {
        brushShapesTypes.forEach((brushElement, index) => {
          if (ref.current === brushTypesRefs[index].current) {
            brushTypesRefs[index + 1].current.click()
            brushTypesRefs[index + 1].current.focus()
          }
        })
      }
    } else if (!isNext) {
      if (ref.current === brushTypesRefs[0].current) {
        brushTypesRefs[7].current.focus()
        brushTypesRefs[7].current.click()
      } else {
        brushShapesTypes.forEach((brushElement, index) => {
          if (ref.current === brushTypesRefs[index].current) {
            brushTypesRefs[index - 1].current.focus()
            brushTypesRefs[index - 1].current.click()
          }
        })
      }
    }
  }

  const getBrushTypes = (activeWidth: number, activeShape: string) => {
    return (
      brushShapesTypes.map((brushShapeType: Object, index: number) => {
        const brushType = brushShapeType.size
        const brushShape = brushShapeType.shape
        let brushClass = `${brushButtonClass}`

        if (brushShape === brushRoundShape) {
          brushClass += ` ${brushButtonCircleClass}`
        }

        if (brushType === brushLargeSize) {
          brushClass += ` ${brushButtonLargeClass}`
        } else if (brushType === brushMediumSize) {
          brushClass += ` ${brushButtonMediumClass}`
        } else if (brushType === brushSmallSize) {
          brushClass += ` ${brushButtonSmallClass}`
        } else if (brushType === brushTinySize) {
          brushClass += ` ${brushButtonTinyClass}`
        }

        if ((activeWidth === brushType && activeShape === brushShape)) {
          brushClass += ` ${brushButtonActiveClass}`
        }

        const triggerSetBrushShapeSize = () => {
          setBrushShapeSize(brushShape, brushType)
        }

        return <RadioButton
          className={`${brushClass}`}
          key={`${brushShape}-${brushType}`}
          triggerSetBrushShapeSize={triggerSetBrushShapeSize}
          enableBrushType={enableBrushType}
          isSelected={(activeWidth === brushType && activeShape === brushShape)}
          value={`${brushShape}-${brushType}`}
          ariaLabel={intl.formatMessage({ id: ARIA_LABEL }, { brushType: brushType, brushShape: brushShape, brushTypeName: brushTypeName })}
          id={`${brushTypeName}${index}`}
          ref={brushTypesRefs[index]}
          brushTypeName={brushTypeName}
        />
      })
    )
  }

  return (
    <div className={`${wrapperClass}`} role='radiogroup' aria-labelledby={`${brushTypeName}BrushType`}>
      <div className={'visually-hidden'} id={`${brushTypeName}BrushType`}>{`${brushTypeName} Brush Types`}</div>
      <div className={`${shapesContainerClass}`}>
        {getBrushTypes(activeWidth, activeShape)}
      </div>
    </div>
  )
}

export default BrushTypes
