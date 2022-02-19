// @flow
import uniqueId from 'lodash/uniqueId'
import ensureFullyQualifiedAssetUrl from 'src/shared/utils/ensureFullyQualifiedAssetUrl.util'
import MaskObj from './MaskObj'

const MASK_ID_PREFIX = 'msk'

const masks: MaskObj[] = []

export const registerMask = (path: string) => {
  const id = uniqueId(MASK_ID_PREFIX)
  const maskObj = new MaskObj({
    id,
    load: ensureFullyQualifiedAssetUrl(path)
  })

  masks[masks.length] = maskObj

  return maskObj
}

export const updateMask = (mask: MaskObj | string, data: Blob): MaskObj | void => {
  let updatedEntry: MaskObj | void = void (0)
  let _mask: MaskObj | typeof undefined

  if (typeof mask === 'string') {
    _mask = getMaskById(mask)
  } else if (mask) {
    _mask = mask
  }

  masks.forEach((mask, i) => {
    if (mask === _mask) {
      updatedEntry = masks[i].updateMask(data)
    }
  })

  return updatedEntry
}

export const getMaskById = (id: string): MaskObj | void => {
  return masks.filter(mask => mask.id === id)[0]
}
