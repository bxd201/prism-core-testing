// @flow
import React from 'react'
import { fullColorNumber, getContrastYIQ } from '../../../src/shared/helpers/ColorUtils'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import 'src/providers/fontawesome/fontawesome'
import type { Color } from '../../shared/types/Colors.js.flow'
import type { FlatScene, FlatVariant } from '../../shared/types/Scene'
import WithConfigurationContext, { type ConfigurationContextType } from '../../contexts/ConfigurationContext/WithConfigurationContext'
import './CompareColor.scss'
import { FormattedMessage } from 'react-intl'
import SingleTintableSceneView from '../SingleTintableSceneView/SingleTintableSceneView'
import { createMiniColorFromColor } from '../SingleTintableSceneView/util'

const baseClass = 'color__comparison'
const containerClass = `${baseClass}__container`
const containerHeaderClass = `${baseClass}__container__header`
const containerHeaderButtonClass = `${baseClass}__container__header__button`
const wrapperClass = `${baseClass}__wrapper`
const prevBtnWrapperClass = `${baseClass}__prev-btn__wrapper`
const buttonsClass = `${baseClass}__buttons`
const buttonsVisibleClass = `${baseClass}__buttons--visible`
const nextBtnWrapperClass = `${baseClass}__next-btn__wrapper`
const backgroundColorClass = `${baseClass}__background__color`
const queueWrapperClass = `${baseClass}__queue__wrapper`

const defaultViewItem = 3
const offset = 1

type CompareColorProps = {
  colors: Color[],
  config: ConfigurationContextType,
  toggleCompareColor: Function,
  colorIds: string[],
  scenesCollection: FlatScene[],
  variantsCollection: FlatVariant[],
  selectedSceneUid: string,
  selectedVariantName: string
}

type CompareColorState = {
  colors: Color[],
  colorIds: string[],
  renderColors: Color[],
  curr: number,
  isHideNextButton: boolean,
  isHidePrevButton: boolean
}
export class CompareColor extends React.Component<CompareColorProps, CompareColorState> {
  state = {
    colors: this.props.colors,
    colorIds: this.props.colorIds,
    renderColors: [],
    curr: 0,
    isHidePrevButton: true,
    isHideNextButton: true,
    selectedSceneUid: this.props.selectedSceneUid,
    selectedVariantName: this.props.selectedVariantName
  }

  static getDerivedStateFromProps (props: CompareColorProps, state: CompareColorState) {
    if (props.colors !== state.colors) {
      return {
        colors: props.colors
      }
    }
    if (props.colorIds !== state.colorIds) {
      if (props.colorIds.length === state.colors.length - 1) {
        props.toggleCompareColor()
        return null
      }
      let currPointer = state.curr
      // when remove compared color id from color paltete
      if (props.colorIds.length > state.colorIds.length) {
        if (state.colors.length - props.colorIds.length <= defaultViewItem || currPointer === 0) {
          currPointer = 0
        } else {
          currPointer = currPointer - offset
        }
      }
      // when add compared color id from color pallate
      if (props.colorIds.length < state.colorIds.length) {
        if (state.colors.length - props.colorIds.length - 1 <= defaultViewItem) {
          currPointer = 0
        } else {
          currPointer = currPointer + 1
        }
      }
      return {
        colorIds: props.colorIds,
        curr: currPointer
      }
    }
    return null
  }

  componentDidUpdate (prevProps, prevState) {
    if (prevProps.selectedSceneUid !== this.props.selectedSceneUid ||
        prevProps.selectedVariantName !== this.props.selectedVariantName) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        selectedSceneUid: this.props.selectedSceneUid,
        selectedVariantName: this.props.selectedVariantName
      })
    }
  }

  renderContent = (curr: number, colors: Colors[], colorIds: string, colorInfoClass: string, colorNumOnBottom: boolean, selectedSceneUid: string, selectedVariantName: string, scenesCollection: FlatScene[], variantsCollection: FlatVariant[]) => {
    const renderColors = colors.filter((color: Color) => {
      return !colorIds.includes(color.id)
    })
    return renderColors && renderColors.map((color, index) => {
      const selectedVariant = variantsCollection.find(variant => variant.sceneUid === selectedSceneUid && variant.variantName === selectedVariantName)
      const selectedScene = scenesCollection.find(scene => scene.uid === selectedSceneUid)
      const colorDataTemplate = selectedVariant.surfaces.map(surface => null)
      const fillFirstSurfaceColor = (template, color) => {
        const miniColor = createMiniColorFromColor(color)
        return template.map((placeholder, i) => {
          return i ? null : miniColor
        })
      }
      const colorsForView = fillFirstSurfaceColor(colorDataTemplate, color)
      return (
        <div key={index} style={{ backgroundColor: color.hex, transform: `translateX(-${curr * 100}%)` }} className={`${queueWrapperClass}`}>
          <div className={`${backgroundColorClass}`} />
          <SingleTintableSceneView
            surfaceColorsFromParents={colorsForView}
            selectedSceneUid={selectedSceneUid}
            scenesCollection={[selectedScene]}
            variantsCollection={[selectedVariant]} />
          <div style={{ color: getContrastYIQ(color.hex) }} className={`${colorInfoClass}${colorNumOnBottom ? '__name-number' : ''}`} >
            <span className={`${colorInfoClass}__number`}>{fullColorNumber(color.brandKey, color.colorNumber)}</span>
            <span className={`${colorInfoClass}__name`}>{color.name}</span>
          </div>
        </div>
      )
    })
  }

  isShowSlideButton = () => {
    const { curr, colors, colorIds } = this.state
    const itemsCount = colors.length - colorIds.length
    const buttonVisibility = {
      isHidePrevButton: true,
      isHideNextButton: true
    }
    if (curr === 0) {
      buttonVisibility.isHidePrevButton = true
    } else {
      buttonVisibility.isHidePrevButton = false
    }

    if (itemsCount > defaultViewItem && curr < itemsCount - defaultViewItem) {
      buttonVisibility.isHideNextButton = false
    }

    if (curr === itemsCount - defaultViewItem - offset / 2) {
      buttonVisibility.isHideNextButton = true
    }
    return buttonVisibility
  }

  handlePrev = () => {
    const { colors, curr, colorIds } = this.state
    const itemsCount = colors.length - colorIds.length
    if (itemsCount > defaultViewItem) {
      if (curr === (offset / 2)) {
        this.setState({ curr: curr - offset / 2 })
      } else {
        this.setState({ curr: curr - offset })
      }
    }
  }

  handleNext = () => {
    const { colors, curr, colorIds } = this.state
    const itemsCount = colors.length - colorIds.length
    if (itemsCount > defaultViewItem) {
      if (curr === itemsCount - defaultViewItem - 1) {
        this.setState({ curr: curr + offset / 2 })
      } else {
        this.setState({ curr: curr + offset })
      }
    }
  }

  render () {
    const { curr, colors, colorIds, selectedSceneUid, selectedVariantName } = this.state
    const { config, variantsCollection, scenesCollection } = this.props
    const { colorWall: { colorSwatch = {} }, cvw = {} } = config
    const { colorNumOnBottom = false, houseShaped = false } = colorSwatch
    const { closeBtn = {} } = cvw
    const { showArrow: closeBtnShowArrow = true, text: closeBtnText = <FormattedMessage id='CLOSE' /> } = closeBtn
    const colorInfoClass = houseShaped ? `${baseClass}-house-shaped` : `${baseClass}__color__info`
    const content = this.renderContent(curr, colors, colorIds, colorInfoClass, colorNumOnBottom, selectedSceneUid, selectedVariantName, scenesCollection, variantsCollection)
    const { isHidePrevButton, isHideNextButton } = this.isShowSlideButton()

    return (
        <div className={`${containerClass}`}>
          <div className={`${containerHeaderClass}`}>
            <span><FormattedMessage id='COMPARE_COLORS' /></span>
            <button className={`${containerHeaderButtonClass}`} onClick={this.props.toggleCompareColor}> {closeBtnText ?? <FormattedMessage id='CLOSE' />}{closeBtnShowArrow && <FontAwesomeIcon className={`${containerHeaderClass}--icon`} icon={['fa', 'chevron-up']} />}</button>
          </div>
          <div className={`${wrapperClass}`} >
            <div className={`${prevBtnWrapperClass}`}>
              {
                <button className={`${buttonsClass} ${isHidePrevButton ? `${buttonsVisibleClass}` : ''}`} onClick={this.handlePrev}>
                  <FontAwesomeIcon icon={['fa', 'chevron-left']} />
                </button>}
            </div>
            {content}
            <div className={`${nextBtnWrapperClass}`}>
              {
                <button className={`${buttonsClass} ${isHideNextButton ? `${buttonsVisibleClass}` : ''}`} onClick={this.handleNext}>
                  <FontAwesomeIcon icon={['fa', 'chevron-right']} />
                </button>
              }
            </div>
          </div>
        </div>
    )
  }
}

export {
  containerClass,
  containerHeaderClass,
  containerHeaderButtonClass,
  wrapperClass,
  prevBtnWrapperClass,
  buttonsClass,
  buttonsVisibleClass,
  nextBtnWrapperClass,
  backgroundColorClass,
  queueWrapperClass
}

export default WithConfigurationContext(CompareColor)
