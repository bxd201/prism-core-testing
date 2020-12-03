// @flow strict
import Jimp from 'jimp'
import { IntlShape } from 'react-intl'
import type { Color } from '../../shared/types/Colors'
import type { SceneInfo } from '../types/Scene'
import { ACTIVE_SCENE_LABELS_ENUM } from '../../store/actions/navigation'

const generateImage = async (scene: SceneInfo, activeComponent: string, config: Object, intl: IntlShape): Jimp => {
  // Load base image, logos, and text
  const isPaintScene = activeComponent === ACTIVE_SCENE_LABELS_ENUM.PAINT_SCENE
  const [image, logo, bottomLogo, smallBlackFont] = await Promise.all([
    isPaintScene ? Jimp.read(scene) : Jimp.read(scene.variant.image),
    config.headerLogo && Jimp.read(config.headerLogo),
    config.bottomLogo && Jimp.read(config.bottomLogo),
    Jimp.loadFont(`${BASE_PATH}/prism/fonts/scene-download/open-sans-16-black.fnt`)
  ])

  const downloadDisclaimer1 = config.downloadDisclaimer1
  const downloadDisclaimer2 = config.downloadDisclaimer2
  const originText = 'ORIGINAL'

  // Create array of colored surfaces
  const useBlackText = (hexColor: string) => {
    const hexString = hexColor.replace('#', '')
    const r = parseInt(hexString.substr(0, 2), 16)
    const g = parseInt(hexString.substr(2, 2), 16)
    const b = parseInt(hexString.substr(4, 2), 16)
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000
    return yiq >= 128
  }

  const coloredSurfaces = !isPaintScene && scene.status.surfaces.filter(surface => surface.color)
  const livePaletteColors: Color[] = JSON.parse(window.localStorage.getItem('lp')).colors
  const blackFontsArray: boolean[] = livePaletteColors.map(color => useBlackText(color.hex))

  let blackFonts = {
    regular: undefined,
    small: smallBlackFont,
    bold: undefined,
    smallBold: undefined
  }
  if (blackFontsArray.includes(true)) {
    const [font, boldFont] = await Promise.all([
      Jimp.loadFont(`${BASE_PATH}/prism/fonts/scene-download/open-sans-32-black.fnt`),
      Jimp.loadFont(`${BASE_PATH}/prism/fonts/scene-download/open-sans-bold-32-black.fnt`)
      // Jimp.loadFont(`${BASE_PATH}/prism/fonts/scene-download/open-sans-bold-16-black.fnt`)
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

  if (!isPaintScene) {
    const masks: Jimp[] = coloredSurfaces.map(surface => {
      const maskPath = scene.surfaces.find(surf => surf.id === surface.id).mask._load
      return Jimp.read(maskPath)
    })

    // Resolve Jimp promises into array of Jimp images
    const maskImages = []
    await Promise.all(masks).then(resultArray => resultArray.forEach(result => maskImages.push(result)))

    // Iterate through Jimp images and apply each mask to base image
    coloredSurfaces.forEach((surface, idx) => {
      const colorHex = surface.color.hex
      maskImages[idx].mask(maskImages[idx], 0, 0).color([{ apply: 'mix', params: [colorHex, 100] }])

      image.composite(maskImages[idx], 0, 0, {
        mode: Jimp.BLEND_MULTIPLY,
        opacitySource: 1,
        opacityDest: 1
      })
    })
  } else {
    const currWidth = image.bitmap.width
    const currHeight = image.bitmap.height
    const properWidth = 1280
    const borderWidth = 10
    const textWidth = 80
    const textHeight = 20

    const miniImgBorderLeft = new Jimp(borderWidth, (1 / 3) * currHeight, '#fff')
    image.composite(miniImgBorderLeft, (2 / 3) * currWidth - borderWidth, (2 / 3) * currHeight)

    const miniImgBorderTop = new Jimp((1 / 3) * currWidth, borderWidth, '#fff')
    image.composite(miniImgBorderTop, (2 / 3) * currWidth, (2 / 3) * currHeight)

    const textBackground = new Jimp(textWidth, textHeight, '#fff')
    textBackground.print(blackFonts.small, 0, 0, originText)
    image.composite(textBackground, currWidth - textWidth, (2 / 3) * currHeight + borderWidth)
    image.resize(properWidth, Jimp.AUTO)
  }

  // Brochure composition settings
  const swatchRows = Math.ceil(livePaletteColors.length / 2)
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
    disclaimerY = bottomLogoY
  }

  image.print(blackFonts.small, disclaimerX, disclaimerY, downloadDisclaimer1, maxDisclaimerWidth, (err, image, { x, y }) => {
    if (err) {
      console.warn(err)
      return
    }
    image.print(blackFonts.small, disclaimerX, y + 16, downloadDisclaimer2, maxDisclaimerWidth)
  })

  // Generate array of swatch images from colors in Live Palette
  const swatchImages = livePaletteColors.map(color => {
    const colorHex = color.hex
    const swatchImage = new Jimp(swatchWidth, swatchHeight, colorHex)
    const textYStart = swatchHeight - 32 * 3 - 20
    const contrastFont = useBlackText(colorHex) ? blackFonts.regular : whiteFonts.regular
    const smallContrastFont = useBlackText(colorHex) ? blackFonts.small : whiteFonts.small
    const boldContrastFont = useBlackText(colorHex) ? blackFonts.bold : whiteFonts.bold

    // Print swatch details
    swatchImage.print(contrastFont, 10, textYStart, `${color.brandKey} ${color.colorNumber}`, (err, image, { x, y }) => {
      if (err) {
        console.warn(err)
        return
      }
      image.print(boldContrastFont, 10, y, color.name, (err, image, { x, y }) => {
        if (err) {
          console.warn(err)
          return
        }
        if (color.storeStripLocator) {
          image.print(contrastFont, 10, y, `Locator Number: ${color.storeStripLocator}`)
        }
      })
    })

    // Print featured text

    if (!isPaintScene) {
      const featuredColorNumbers: string[] = coloredSurfaces.map(surface => surface.color.colorNumber)
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
