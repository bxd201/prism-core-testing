// @flow
import React, { useEffect, useState } from 'react'
import { FormattedMessage } from 'react-intl'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ROUTE_PARAMS } from 'constants/globals'
import { flattenDeep } from 'lodash'
import { type ColorsState } from 'src/shared/types/Actions.js.flow'
import 'src/providers/fontawesome/fontawesome'
import { fullColorName, generateColorWallPageUrl } from '../../../shared/helpers/ColorUtils'
import { urlWorker } from '../../../shared/helpers/URLUtils'
import { type Color } from '../../../shared/types/Colors'
import ButtonBar from '../../GeneralButtons/ButtonBar/ButtonBar'
import { MODE_CLASS_NAMES } from '../ColorWall/shared'

function findMatchIn(lookIn: Array<string | number> = [], lookFor: string | number) {
  if (lookIn.length === 0) return false
  if (typeof lookFor === 'undefined') return false

  const lookForAsString = String(lookFor)

  return lookIn.reduce((accum, next) => {
    if (accum) return true
    if (String(next) === lookForAsString) return true
  }, false)
}

function getWallColorIds(val: any): Array<number | string> {
  if (val.type === 'CHUNK') {
    return val.children
  }
  if (val.children) {
    return flattenDeep(val.children.map(getWallColorIds))
  }
  return []
}

export function BackToColorWall() {
  const {
    items: { colorMap = {} },
    status: { requestComplete, error },
    cwv3,
    layouts,
    groups,
    subgroups,
    shapes,
    family,
    section,
    search,
    structure
  }: ColorsState = useSelector((state) => state.colors)
  const { colorId }: { colorId?: ?string } = useParams()
  const color: Color = colorId && colorMap[colorId]

  const [backPath, setBackPath] = useState('')

  useEffect(() => {
    if (colorId && requestComplete && !error && color) {
      if (!cwv3) {
        // non-CWv3, legacy color wall
        // !cwv3 => colors > layouts { name: <section> } > families { name: <family> } > flattenDeep(unChunkedChunks)
        // !cwv3 => colors > structure { default: true }.name <-- use as link for "Back to wall"
        if (section) {
          const foundSection = layouts.reduce((accum, next) => {
            if (accum) return accum
            if (next.name === section) return next
          }, null)

          if (family && foundSection) {
            // find ID in family
            // if the above fails, and we detect this is a bright, look for its bright in this family
            const foundFamily = foundSection.families.reduce((accum, next) => {
              if (accum) return accum
              if (next.name === family) return next
            }, null)

            if (foundFamily) {
              // flatten its unChunkedChunks to match on colorId
              // if match, use foundfamily and section to form the back link
              if (findMatchIn(flattenDeep(foundFamily.unChunkedChunks), colorId)) {
                // we found one in family! do something about it
                setBackPath(
                  generateColorWallPageUrl(
                    foundSection.name,
                    foundFamily.name,
                    colorId,
                    fullColorName(color.brandKey, color.colorNumber, color.name)
                  )
                )
                return () => {}
              }

              if (findMatchIn(flattenDeep(foundFamily.unChunkedChunks), `bright-${colorId}`)) {
                // we found one in family! do something about it
                setBackPath(
                  generateColorWallPageUrl(
                    foundSection.name,
                    foundFamily.name,
                    `bright-${colorId}`,
                    fullColorName(color.brandKey, color.colorNumber, color.name)
                  )
                )
                return () => {}
              }
            }
          }

          if (foundSection) {
            // find ID in section
            if (findMatchIn(flattenDeep(foundSection.unChunkedChunks), colorId)) {
              // we found one in section! do something about it
              setBackPath(
                generateColorWallPageUrl(
                  foundSection.name,
                  null,
                  colorId,
                  fullColorName(color.brandKey, color.colorNumber, color.name)
                )
              )
              return () => {}
            }

            if (findMatchIn(flattenDeep(foundSection.unChunkedChunks), `bright-${colorId}`)) {
              // we found one in section! do something about it
              setBackPath(
                generateColorWallPageUrl(
                  foundSection.name,
                  null,
                  `bright-${colorId}`,
                  fullColorName(color.brandKey, color.colorNumber, color.name)
                )
              )
              return () => {}
            }
          }

          // if the above fails and we detect this is a bright, look for its bright in this family
        }

        const defaultSection =
          structure.reduce((accum, next) => {
            if (accum) return accum
            if (next.default) return next
            return accum
          }, null) || structure[0]

        if (defaultSection) {
          const foundSection = layouts.reduce((accum, next) => {
            if (accum) return accum
            if (next.name === defaultSection.name) return next
          }, null)

          if (foundSection) {
            if (findMatchIn(flattenDeep(foundSection.unChunkedChunks), colorId)) {
              setBackPath(
                generateColorWallPageUrl(
                  foundSection.name,
                  null,
                  colorId,
                  fullColorName(color.brandKey, color.colorNumber, color.name)
                )
              )
              return () => {}
            }

            if (findMatchIn(flattenDeep(foundSection.unChunkedChunks), `bright-${colorId}`)) {
              setBackPath(
                generateColorWallPageUrl(
                  foundSection.name,
                  null,
                  `bright-${colorId}`,
                  fullColorName(color.brandKey, color.colorNumber, color.name)
                )
              )
              return () => {}
            }
          }

          setBackPath(generateColorWallPageUrl(defaultSection.name))
          return () => {}
        }
      } else {
        // CWv3, modern color wall
        // cwv3 => colors > groups { name: <section> } > subgroups { name: <family> } > shapeId... but shape will need a lot of work to extract colors
        // cwv3 => colors > groups { default: true }.name <-- use as link for "back to wall"
        if (section) {
          const foundSection = groups.reduce((accum, next) => {
            if (accum) return accum
            if (next.name === section) return next
          }, null)

          if (family && foundSection) {
            // find ID in family
            // if the above fails, and we detect this is a bright, look for its bright in this family
            const subgroupMapping = foundSection.subgroups
              .map((sgId) => subgroups.filter((sg) => sg.id === sgId)[0])
              .filter(Boolean)

            const foundFamily = subgroupMapping.reduce((accum, next) => {
              if (accum) return accum
              if (next.name === family) return next
            }, null)

            if (foundFamily) {
              const famShape = shapes.filter((v) => v.id === foundFamily.shapeId)[0]
              const colorIds = famShape ? getWallColorIds(famShape.shape) : null
              // flatten its unChunkedChunks to match on colorId
              // if match, use foundfamily and section to form the back link
              if (colorIds && findMatchIn(colorIds, colorId)) {
                // we found one in family! do something about it
                setBackPath(
                  generateColorWallPageUrl(
                    foundSection.name,
                    foundFamily.name,
                    colorId,
                    fullColorName(color.brandKey, color.colorNumber, color.name)
                  )
                )
                return () => {}
              }

              if (colorIds && findMatchIn(colorIds, `bright-${colorId}`)) {
                // we found one in family! do something about it
                setBackPath(
                  generateColorWallPageUrl(
                    foundSection.name,
                    foundFamily.name,
                    `bright-${colorId}`,
                    fullColorName(color.brandKey, color.colorNumber, color.name)
                  )
                )
                return () => {}
              }
            }
          }

          if (foundSection) {
            const sectShape = shapes.filter((v) => v.id === foundSection.shapeId)[0]
            const colorIds = sectShape ? getWallColorIds(sectShape.shape) : null
            // find ID in section
            if (colorIds && findMatchIn(colorIds, colorId)) {
              // we found one in section! do something about it
              setBackPath(
                generateColorWallPageUrl(
                  foundSection.name,
                  null,
                  colorId,
                  fullColorName(color.brandKey, color.colorNumber, color.name)
                )
              )
              return () => {}
            }

            if (colorIds && findMatchIn(colorIds, `bright-${colorId}`)) {
              // we found one in section! do something about it
              setBackPath(
                generateColorWallPageUrl(
                  foundSection.name,
                  null,
                  `bright-${colorId}`,
                  fullColorName(color.brandKey, color.colorNumber, color.name)
                )
              )
              return () => {}
            }
          }

          // if the above fails and we detect this is a bright, look for its bright in this family
        }

        const defaultSection =
          groups.reduce((accum, next) => {
            if (accum) return accum
            if (next.default) return next
            return accum
          }, null) || groups[0]

        if (defaultSection) {
          const sectShape = shapes.filter((v) => v.id === defaultSection.shapeId)[0]
          const colorIds = sectShape ? getWallColorIds(sectShape.shape) : null

          if (colorIds && findMatchIn(colorIds, colorId)) {
            setBackPath(
              generateColorWallPageUrl(
                defaultSection.name,
                null,
                colorId,
                fullColorName(color.brandKey, color.colorNumber, color.name)
              )
            )
            return () => {}
          }

          if (colorIds && findMatchIn(colorIds, `bright-${colorId}`)) {
            setBackPath(
              generateColorWallPageUrl(
                defaultSection.name,
                null,
                `bright-${colorId}`,
                fullColorName(color.brandKey, color.colorNumber, color.name)
              )
            )
            return () => {}
          }

          setBackPath(generateColorWallPageUrl(defaultSection.name))
          return () => {}
        }
      }
    }
  }, [colorId, color, section, family, cwv3, layouts, groups, subgroups, shapes, structure, requestComplete, error])

  const url = search.active && search.query ? urlWorker.set(ROUTE_PARAMS.SEARCH, search.query).in(backPath) : backPath
  return (
    <div className={MODE_CLASS_NAMES.BASE}>
      <div className={MODE_CLASS_NAMES.COL}>
        <div className={MODE_CLASS_NAMES.CELL}>
          <ButtonBar.Bar>
            <ButtonBar.Button to={url}>
              <FontAwesomeIcon icon={['fal', 'th-large']} pull='left' fixedWidth />
              <FormattedMessage id='BACK_TO_COLOR_WALL' />
            </ButtonBar.Button>
          </ButtonBar.Bar>
        </div>
      </div>
    </div>
  )
}

export default BackToColorWall
