// @flow strict
import Jimp from 'jimp'
import { IntlShape } from 'react-intl'
import type { MiniColor } from '../types/Scene'
import { type Color } from 'src/shared/types/Colors'
import { SCENE_TYPES } from '../../constants/globals'
import { fullColorNumber } from 'src/shared/helpers/ColorUtils'

const generateImage = async (data: any, surfaceColors: MiniColor[], config: Object, intl: IntlShape, swatchColors: Color[], swatchSections: string[] = []): Jimp => {
  const isPaintScene = !data.variantName
  const [image, logo, bottomLogo, smallBlackFont] = await Promise.all([
    isPaintScene ? Jimp.read(data) : Jimp.read(data.image),
    config.headerLogo && Jimp.read(config.headerLogo),
    config.bottomLogo && Jimp.read(config.bottomLogo),
    Jimp.loadFont(`${BASE_PATH}/prism/fonts/scene-download/open-sans-16-black.fnt`)
  ])
  const downloadDisclaimer1 = config.downloadDisclaimer1
  const downloadDisclaimer2 = config.downloadDisclaimer2

  const useBlackText = (hexColor: string) => {
    const hexString = hexColor.replace('#', '')
    const r = parseInt(hexString.substr(0, 2), 16)
    const g = parseInt(hexString.substr(2, 2), 16)
    const b = parseInt(hexString.substr(4, 2), 16)
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000
    return yiq >= 128
  }

  const coloredSurfaces = !isPaintScene && surfaceColors
  const blackFontsArray: boolean[] = swatchColors.map(color => useBlackText(color.hex))

  const blackFonts = {
    regular: undefined,
    small: smallBlackFont,
    bold: undefined,
    smallBold: undefined
  }
  if (blackFontsArray.includes(true)) {
    const [font, boldFont] = await Promise.all([
      Jimp.loadFont(`${BASE_PATH}/prism/fonts/scene-download/open-sans-32-black.fnt`),
      Jimp.loadFont(`${BASE_PATH}/prism/fonts/scene-download/open-sans-bold-32-black.fnt`)
    ])

    blackFonts.regular = font
    blackFonts.bold = boldFont
    // blackFonts.smallBold = smallBoldFont
  }

  let whiteFonts = {}
  if (blackFontsArray.includes(false)) {
    const [font, smallFont, boldFont] = await Promise.all([
      Jimp.loadFont(`${BASE_PATH}/prism/fonts/scene-download/open-sans-32-white.fnt`),
      Jimp.loadFont(`${BASE_PATH}/prism/fonts/scene-download/open-sans-16-white.fnt`),
      Jimp.loadFont(`${BASE_PATH}/prism/fonts/scene-download/open-sans-bold-32-white.fnt`)
    ])

    whiteFonts = {
      regular: font,
      small: smallFont,
      bold: boldFont
    }
  }

  const properWidth = 1280
  const borderWidth = 10
  const textWidth = 80
  const textHeight = 20

  if (!isPaintScene) {
    const masks: Jimp[] = data.surfaces.map(surface => {
      return Jimp.read(surface.surfaceBlobUrl)
    })

    const maskImages = []
    await Promise.all(masks).then(resultArray => resultArray.forEach(result => maskImages.push(result)))

    surfaceColors.forEach((color, idx) => {
      if (color) {
        const colorHex = color.hex
        maskImages[idx].mask(maskImages[idx], 0, 0).color([{ apply: 'mix', params: [colorHex, 100] }])

        image.composite(maskImages[idx], 0, 0, {
          mode: Jimp.BLEND_MULTIPLY,
          opacitySource: 1,
          opacityDest: 1
        })
      }
    })
    if (data?.sceneType === SCENE_TYPES.FAST_MASK) {
      image.resize(properWidth, Jimp.AUTO)
    }
  } else {
    const currWidth = image.bitmap.width
    const currHeight = image.bitmap.height

    const miniImgBorderLeft = new Jimp(borderWidth, (1 / 3) * currHeight, '#fff')
    image.composite(miniImgBorderLeft, (2 / 3) * currWidth - borderWidth, (2 / 3) * currHeight)

    const miniImgBorderTop = new Jimp((1 / 3) * currWidth, borderWidth, '#fff')
    image.composite(miniImgBorderTop, (2 / 3) * currWidth, (2 / 3) * currHeight)

    const textBackground = new Jimp(textWidth, textHeight, '#fff')
    textBackground.print(blackFonts.small, 0, 0, intl.formatMessage({ id: 'ORIGIN_TEXT' }))
    image.composite(textBackground, currWidth - textWidth, (2 / 3) * currHeight + borderWidth)
    image.resize(properWidth, Jimp.AUTO)
  }

  // Brochure composition settings
  const swatchRows = Math.ceil(swatchColors.length / 2)
  const headerHeight = 200
  const headerLogoHeight = Math.floor(headerHeight * 0.9)
  const topMargin = logo ? headerHeight : 0
  const footerHeight = 200
  const padding = 20
  const swatchHeight = 200
  const swatchWidth = (image.bitmap.width - padding) / 2
  const bottomMargin = footerHeight + ((swatchHeight + padding) * swatchRows)
  let bottomLogoResizeWith = 400

  // Add white space above image and add logo
  const newHeight = image.bitmap.height + topMargin
  image.background(0xFFFFFFFF)
  image.contain(image.bitmap.width, newHeight, Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_BOTTOM)
  if (logo) {
    if (logo.bitmap.height > headerLogoHeight) {
      logo.resize(Jimp.AUTO, headerLogoHeight)
    }

    const logoX = (image.bitmap.width - logo.bitmap.width) / 2
    const logoY = (topMargin - logo.bitmap.height) / 2

    image.composite(logo, logoX, logoY, {
      mode: Jimp.BLEND_SOURCE_OVER,
      opacitySource: 1,
      opacityDest: 1
    })
  }

  // Add white space below image and add logo
  const finalHeight = image.bitmap.height + bottomMargin
  const maxDisclaimerWidth = 600
  let disclaimerX = 0
  let disclaimerY = 0
  image.contain(image.bitmap.width, finalHeight, Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_TOP)
  if (bottomLogo) {
    if (bottomLogo.bitmap.width === bottomLogo.bitmap.height) {
      bottomLogoResizeWith = 200
    }
    bottomLogo.resize(bottomLogoResizeWith, Jimp.AUTO)
    const bottomLogoX = (swatchWidth - bottomLogoResizeWith) / 2
    const bottomLogoY = image.bitmap.height - footerHeight + (footerHeight - bottomLogo.bitmap.height) / 2
    image.composite(bottomLogo, bottomLogoX, bottomLogoY, {
      mode: Jimp.BLEND_SOURCE_OVER,
      opacitySource: 1,
      opacityDest: 1
    })
    disclaimerX = bottomLogo.bitmap.width + 2 * bottomLogoX
  } else {
    disclaimerX = padding
  }
  disclaimerY = finalHeight - footerHeight + padding

  image.print(blackFonts.small, disclaimerX, disclaimerY, downloadDisclaimer1, maxDisclaimerWidth, (err, image, { x, y }) => {
    if (err) {
      console.warn(err)
      return
    }
    image.print(blackFonts.small, disclaimerX, y + 16, downloadDisclaimer2, maxDisclaimerWidth)
  })

  // Generate array of swatch images from colors in Live Palette
  const swatchImages = swatchColors.map((color, i) => {
    const colorHex = color.hex
    const swatchImage = new Jimp(swatchWidth, swatchHeight, colorHex)
    const textYStart = swatchHeight - 32 * 3 - 20
    const contrastFont = useBlackText(colorHex) ? blackFonts.regular : whiteFonts.regular
    const smallContrastFont = useBlackText(colorHex) ? blackFonts.small : whiteFonts.small
    const boldContrastFont = useBlackText(colorHex) ? blackFonts.bold : whiteFonts.bold
    const nextLineOffset = -7 // tighten up space between lines

    // Print swatch details
    swatchImage.print(contrastFont, 10, textYStart, fullColorNumber(color.brandKey, color.colorNumber), (err, image, { x, y }) => {
      if (err) {
        console.warn(err)
        return
      }
      image.print(boldContrastFont, 10, y + nextLineOffset, color.name, (err, image, { x, y }) => {
        if (err) {
          console.warn(err)
          return
        }

        if (color.storeStripLocator) {
          image.print(contrastFont, 10, y + nextLineOffset, `Locator Number: ${color.storeStripLocator}`)
        } else if (swatchSections[i]) {
          image.print(contrastFont, 10, y + nextLineOffset, swatchSections[i])
        }
      })
    })

    if (!isPaintScene) {
      const featuredColorNumbers: string[] = coloredSurfaces.map(color => color?.colorNumber)
      if (featuredColorNumbers.includes(color.colorNumber)) {
        swatchImage.print(smallContrastFont, 10, 10, intl.formatMessage({ id: 'FEATURED_IN_SCENE' }))
      }
    }

    return swatchImage
  })

  const swatchColumnWidth = swatchWidth + padding
  const swatchRowHeight = swatchHeight + padding
  const swatchRow1 = image.bitmap.height - bottomMargin + padding

  // Add swatches to final image
  swatchImages.forEach((swatchImage, idx) => {
    const columnPosition = idx % 2 ? swatchColumnWidth : 0
    const rowNumber = Math.floor(idx / 2)
    const rowPosition = swatchRow1 + (swatchRowHeight * rowNumber)
    image.composite(swatchImage, columnPosition, rowPosition)
  })

  return image
}

export { generateImage }
