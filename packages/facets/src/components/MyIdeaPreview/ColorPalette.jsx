// @flow
import React, { useCallback } from 'react'
import { getContrastYIQ } from '../../../src/shared/helpers/ColorUtils'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useDispatch, useSelector } from 'react-redux'
import { add } from '../../store/actions/live-palette'
import some from 'lodash/some'
import { KEY_CODES } from 'src/constants/globals'
import './ColorPalette.scss'
import { SCENE_TYPE } from 'src/store/actions/persistScene'

type colorPaletteProps = {
  palette: Object,
  savedLivePaletteId?: number | string,
  isMyIdeaLivePalette?: boolean,
  isMyIdeaPreview?: boolean,
  isMyIdeaPreviewLp?: boolean,
  savedLivePaletteName?: string,
  editEnabled?: boolean,
  isEditName?: boolean,
  selectLivePaletteIdea?: () => void,
  deleteLivePaletteIdea?: () => void,
  editLivePaletteIdea?: () => void
}

const baseClass = 'color-palette'
const wrapper = `${baseClass}__wrapper`
const container = `${baseClass}__container`
const deleteLivePalette = `${baseClass}__delete-live-palette`
const deleteLivePaletteBtn = `${baseClass}__delete-live-palette-button`
const wrapperLivePalette = `${wrapper}--my-ideas-live-palette`
const wrapperEditLp = `${wrapper}--my-ideas-edit-lp`
const colorInfo = `${baseClass}__color-info`
const colorInfoDark = `${colorInfo}--dark`
const colorInfoNumber = `${colorInfo}__number`
const colorInfoName = `${colorInfo}__name`
const checkCircle = `${baseClass}__check-circle`
const toggleCheckIcons = `${baseClass}__toggle-check-icons`
const colorsUl = `${wrapper}__colors-ul`
const colorsUlLivePalette = `${colorsUl}--my-ideas-live-palette`
const colorsUlPreview = `${colorsUl}--my-ideas-preview`
const colorsUlPreviewLp = `${colorsUl}--my-ideas-preview-lp`
const colorLi = `${wrapper}__color-li`
const livePaletteName = `${baseClass}__live-palette-name`

const ColorPalette = ({ palette, isMyIdeaLivePalette, isMyIdeaPreview, isMyIdeaPreviewLp, savedLivePaletteName, editEnabled, deleteLivePaletteIdea, selectLivePaletteIdea, editLivePaletteIdea, savedLivePaletteId, isEditName }: colorPaletteProps) => {
  const dispatch = useDispatch()
  const colorsCurrentlyInLivePalette = useSelector(state => state.lp.colors)
  const mouseDownHandler = (e: SyntheticEvent) => {
    e.preventDefault()
  }
  const clickHandler = useCallback((e: SyntheticEvent) => {
    const color = palette.find((color) => (color.colorNumber === e.currentTarget.dataset.colornumber))
    if (color) dispatch(add(color))
  }, [dispatch, palette])

  const deleteLivePaletteIdeaHandler = (e: SyntheticEvent) => {
    e.preventDefault()
    e.stopPropagation()
    deleteLivePaletteIdea(savedLivePaletteId, SCENE_TYPE.livePalette)
  }

  const selectLivePaletteIdeaWrapper = (e: SyntheticEvent) => {
    if (editEnabled) {
      editLivePaletteIdea({ savedLivePaletteId, savedLivePaletteName, palette, sceneType: SCENE_TYPE.livePalette }, false)
      return
    }

    e.preventDefault()
    e.stopPropagation()
    selectLivePaletteIdea && selectLivePaletteIdea(savedLivePaletteId, true)
  }

  const keyDownHandler = (e: SyntheticEvent) => {
    if (e.keyCode && (e.keyCode === KEY_CODES.KEY_CODE_ENTER || e.keyCode === KEY_CODES.KEY_CODE_SPACE)) {
      selectLivePaletteIdeaWrapper(e)
    }
  }

  return (
    <div className={`${wrapper} ${isMyIdeaLivePalette ? `${wrapperLivePalette}` : ``} ${isEditName ? `${wrapperEditLp}` : ``}`}>
      <div className={`${container}`}>
        {editEnabled
          ? <div className={deleteLivePalette}>
            <button className={deleteLivePaletteBtn} onClick={deleteLivePaletteIdeaHandler}>
              <FontAwesomeIcon
                icon={['fal', 'trash-alt']}
                size='sm' />
            </button>
          </div> : null}
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role */}
        {palette && <ul role='button' tabIndex={isMyIdeaLivePalette ? '0' : '-1'} className={`${colorsUl} ${isMyIdeaLivePalette ? `${colorsUlLivePalette}` : ``} ${isMyIdeaPreview ? `${colorsUlPreview}` : ``} ${isMyIdeaPreviewLp ? `${colorsUlPreviewLp}` : ``}`} onClick={selectLivePaletteIdeaWrapper} onKeyDown={keyDownHandler}>
          {
            palette.map((color: Object, index: number) => {
              return (
                <li className={`${colorLi}`} key={`color-${index}`} style={{ backgroundColor: `rgb(${color.red},${color.green},${color.blue})` }}>
                  {!isMyIdeaLivePalette && <div className={`${colorInfo} ${color.isDark ? `${colorInfoDark}` : ``}`}>
                    <span className={`${colorInfoNumber}`}>{color.brandKey} {color.colorNumber}</span>
                    <span className={`${colorInfoName}`}>{color.brandKey} {color.name}</span>
                  </div>}
                  {!isMyIdeaLivePalette && <div className={`${checkCircle}`}>
                    <button data-colornumber={`${color.colorNumber}`} aria-label={`Add ${color.name} to palette`} className={`${toggleCheckIcons}`} tabIndex={some(colorsCurrentlyInLivePalette, color) ? -1 : 0} onClick={clickHandler} onMouseDown={mouseDownHandler}>
                      <FontAwesomeIcon
                        size='2x'
                        style={{ color: getContrastYIQ(color.hex) }}
                        icon={some(colorsCurrentlyInLivePalette, color) ? ['fa', 'check-circle'] : ['fal', 'plus-circle']}
                      />
                    </button>
                  </div>}
                </li>
              )
            })
          }
        </ul>}
        {isMyIdeaLivePalette && !isEditName && <div className={`${livePaletteName}`}>
          {savedLivePaletteName || ''}
        </div>}
      </div>
    </div>
  )
}

export default ColorPalette
