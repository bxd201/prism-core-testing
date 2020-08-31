import 'expect-puppeteer'
import path from 'path'
import fs from 'fs'
import resemble from 'resemblejs'
import mockPalette from '../../../../__mocks__/data/color/mockPalette'

const rootDir = process.cwd()
const testImagePath1 = path.join(rootDir, '__tests__', 'advanced', 'reference-images', 'testimage1.jpg')
// Image should contain a Z drawn on the screen
const checkeredTestImagePath = path.join(rootDir, '__tests__', 'advanced', 'reference-images', 'test-pattern-500x500.png')
const checkeredTestRefImagePath = path.join(rootDir, '__tests__', 'advanced', 'reference-images', 'test-pattern-500x500-ref.png')
const testImagePath2 = path.join(rootDir, '__tests__', 'advanced', 'reference-images', 'testimage2.png')
// This is an ideal ref file that was generated but currently not used
// const twoLineDotRefPath = path.join(rootDir, '__tests__', 'advanced', 'two-line-dot-ref.png')
const blankRefPath = path.join(rootDir, '__tests__', 'advanced', 'reference-images', 'blank-ref.png')
const polygonRefPath = path.join(rootDir, '__tests__', 'advanced', 'reference-images', 'polygon-ref.png')
const twoRectEraseRef = path.join(rootDir, '__tests__', 'advanced', 'reference-images', 'two-rect-erase-ref.png')
const brushesImageRef = path.join(rootDir, '__tests__', 'advanced', 'reference-images', 'brushes-ref.png')
const selectSquareImageRef = path.join(rootDir, '__tests__', 'advanced', 'reference-images', 'select-square-ref.png')
const selectTriangleImageRef = path.join(rootDir, '__tests__', 'advanced', 'reference-images', 'select-triangle-ref.png')

// constants
export const TOOL_ENUM = {
  paintArea: 1,
  paintBrush: 2,
  select: 3,
  erase: 4,
  defineArea: 5,
  removeArea: 6,
  zoom: 7,
  undo: 8,
  redo: 9,
  hidePaint: 10,
  tooltip: 11,
  deleteSelection: 1,
  groupSelection: 2,
  ungroupSelection: 3
}

export const COLOR_ENUM = {
  spa: 1,
  erosPink: 2,
  honeyBees: 3,
  melon: 4
}

export const NAV_ENUM = {
  exploreColors: 1,
  getInspired: 2,
  paintAPhoto: 3
}

export const TEMPLATE_TOKEN = '[ITEM_INDEX]'
export const TOOL_SELECTOR_TEMPLATE = `body > div > div > div.cvw__root-container > div.cvw__root-container__nav-wrapper > div.cvw__root-wrapper > div:nth-child(1) > div > div > div.paint__scene__wrapper > div > div.paint-tool-bar__wrapper > div.paint-tool-bar__tools-container > button:nth-child(${TEMPLATE_TOKEN})`
export const DELETE_GROUP_UNGROUP_SELECTOR_TEMPLATE = `body > div > div > div.cvw__root-container > div.cvw__root-container__nav-wrapper > div.cvw__root-wrapper > div:nth-child(1) > div > div > div.paint__scene__wrapper > div > div.paint-tool-bar__group-tool.paint-tool-bar__group-tool--show > button:nth-child(${TEMPLATE_TOKEN})`
export const COLOR_SELECTOR_TEMPLATE = `body > div > div > div.cvw__root-container > div.cvw__root-container__footer > div.cvw__root-container__footer--priority > div > div.prism-live-palette__list > div:nth-child(${TEMPLATE_TOKEN})`

// This is the canvas that holds the painted layer
export const SECOND_CANVAS_SELECTOR = 'body > div > div > div.cvw__root-container > div.cvw__root-container__nav-wrapper > div.cvw__root-wrapper > div:nth-child(1) > div > div > div.paint__scene__wrapper > canvas.paint__scene__wrapper__canvas-second'
export const BACKGROUND_CANVAS_SELECTOR = 'body > div > div > div.cvw__root-container > div.cvw__root-container__nav-wrapper > div.cvw__root-wrapper > div:nth-child(1) > div > div > div.paint__scene__wrapper > canvas.paint__scene__wrapper__canvas.paint__scene__wrapper__canvas--hide-by-zindex'
export const NAVIGATION_SELECTOR = `body > div > div > div.cvw__root-container > div.cvw__root-container__nav-wrapper > div.cvw__root-container__nav-container > nav > ul.cvw-navigation-wrapper__center > li:nth-child(${TEMPLATE_TOKEN}) > a`
export const UPLOAD_A_PHOTO_BTN = 'body > div > div > div.cvw__root-container > div.cvw__root-container__nav-wrapper > div.cvw__root-wrapper > div.nav__dropdown-overlay > div > div.dashboard-submenu__content > ul > li:nth-child(2)'
export const WARNING_MODAL_CONFIRM_BTN = 'body > div > div > div.cvw__root-container > div.cvw__modal > div.cvw__modal__action-wrapper > button:nth-child(1)'
export const ROTATE_MODAL_AGREE_RADIO_BTN = 'body > div > div > div.cvw__root-container > div.cvw__root-container__nav-wrapper > div.cvw__root-wrapper > div:nth-child(1) > div > div > div.image-rotate-terms-modal__wrapper > div > div.image-rotate-terms-modal__wrapper__agree-terms > div > span:nth-child(1) > label'
export const ROTATE_MODAL_DONE_BTN = 'body > div > div > div.cvw__root-container > div.cvw__root-container__nav-wrapper > div.cvw__root-wrapper > div:nth-child(1) > div > div > div.image-rotate-terms-modal__wrapper > div > button'
export const PAINTSCENE_WRAPPER = 'body > div > div > div.cvw__root-container > div.cvw__root-container__nav-wrapper > div.cvw__root-wrapper'
export const SPLASH_SCREEN_START_BTN = 'body > div > div > div.cvw__root-container > div.cvw-landing-page-wrapper > div.cvw-landing-page-wrapper__painting-btn'

// utility functions
export const loadImage = async (pg, imagePath, loadNew = false) => {
  if (loadNew) {
    // Click another nav option to make loading more predictable
    await navigateTo(pg, NAV_ENUM.getInspired)
    await navigateTo(pg, NAV_ENUM.paintAPhoto)
  }

  const [fileChooser] = await Promise.all([
    pg.waitForFileChooser(),
    pg.click(UPLOAD_A_PHOTO_BTN)
  ])

  await fileChooser.accept([imagePath])

  // If a warning modal appears we need to dismiss it.
  const warningModalConfirmBtn = await pg.$(WARNING_MODAL_CONFIRM_BTN)

  if (warningModalConfirmBtn) {
    await warningModalConfirmBtn.click()
  }

  await pg.click(ROTATE_MODAL_AGREE_RADIO_BTN)
  await pg.click(ROTATE_MODAL_DONE_BTN)
  const paintWrapper = await pg.$(PAINTSCENE_WRAPPER)

  let paintWrapperCoords = await pg.evaluate(wrapper => {
    return JSON.stringify(wrapper.getBoundingClientRect())
  }, paintWrapper)

  return JSON.parse(paintWrapperCoords)
}

export const drawLineFromLeftToRight = async (pg, coords, initX = 50, initY = 50, stepSizeX = 50, stepSizeY = 50) => {
  let x = coords.x + initX
  let y = coords.y + initY

  await pg.mouse.move(x, y)
  await pg.mouse.down()
  const finalX = coords.x + coords.width
  const finalY = coords.y + coords.height
  const loopLimit = 100
  let loopCount = 0

  while ((x < finalX || y < finalY) && loopCount < loopLimit) {
    x += stepSizeX
    y += stepSizeY
    await pg.mouse.move(x, y)

    loopCount++
    // If the sleep is too low it will not draw.
    await pg.waitFor(100)
  }

  await pg.mouse.up()

  return [initX, initY]
}

export const getSecondCanvasData = async (pg) => {
  const canvasData = await getCanvasData(pg, SECOND_CANVAS_SELECTOR)

  return canvasData
}

export const getBackgroundCanvasData = async (pg) => {
  const canvasData = await getCanvasData(pg, BACKGROUND_CANVAS_SELECTOR)

  return canvasData
}

export const getCanvasData = async (pg, selector) => {
  const _canvas = await pg.$(selector)
  const canvasImageUrl = await pg.evaluate(canvas => {
    return canvas.toDataURL()
  }, _canvas)
  await pg.waitFor(3000)

  return canvasImageUrl
}

export const getMismatch = async (pg, refPath, threshold) => {
  const canvasImageUrl = await getSecondCanvasData(pg)
  // Read ref to compare it to current canvas data
  let refData = fs.readFileSync(refPath, { encoding: 'base64' })
  refData = `data:image/png;base64,${refData}`

  let mismatchVal = threshold
  const diff = await resemble(canvasImageUrl).compareTo(refData)
  await diff.onComplete(data => {
    mismatchVal = parseFloat(data.misMatchPercentage)
  })

  // Use mismatch val to compare out put and use canvasImageUrl to save ref when need be
  return {
    mismatchVal,
    canvasImageUrl
  }
}

export const createPolygon = async (pg, points) => {
  for (let i = 0; i <= points.length; i++) {
    if (i < points.length) {
      await pg.mouse.click(points[i].x, points[i].y)
    } else {
      // Close the loop
      await pg.mouse.click(points[0].x, points[0].y)
    }
    await pg.waitFor(300)
  }

  await pg.waitFor(2000)
}

export const selectTool = async (pg, itemIndex) => {
  const toolSelector = TOOL_SELECTOR_TEMPLATE.replace(TEMPLATE_TOKEN, itemIndex)
  await pg.click(toolSelector)
  await pg.waitFor(300)
}

const _handleSelectOperation = async (pg, itemIndex) => {
  const selector = DELETE_GROUP_UNGROUP_SELECTOR_TEMPLATE.replace(TEMPLATE_TOKEN, itemIndex)
  await pg.click(selector)
  await pg.waitFor(300)
}

export const deleteSelection = async pg => {
  await _handleSelectOperation(pg, TOOL_ENUM.deleteSelection)
}

export const groupSelection = async pg => {
  await _handleSelectOperation(pg, TOOL_ENUM.groupSelection)
}

export const ungroupSelection = async pg => {
  await _handleSelectOperation(pg, TOOL_ENUM.ungroupSelection)
}

export const undo = async (pg) => {
  const selector = TOOL_SELECTOR_TEMPLATE.replace(TEMPLATE_TOKEN, TOOL_ENUM.undo)
  await pg.click(selector)
  await pg.waitFor(300)
}

export const redo = async (pg) => {
  const selector = TOOL_SELECTOR_TEMPLATE.replace(TEMPLATE_TOKEN, TOOL_ENUM.redo)
  await pg.click(selector)
  await pg.waitFor(300)
}

export const selectColor = async (pg, itemIndex) => {
  await pg.click(COLOR_SELECTOR_TEMPLATE.replace(TEMPLATE_TOKEN, itemIndex))
  await pg.waitFor(300)
}

export const navigateTo = async (pg, navIndex) => {
  await pg.click(NAVIGATION_SELECTOR.replace(TEMPLATE_TOKEN, navIndex))
  // DON NOT ADD AN EXTRA WAIT HERE IT WILL CAUSE SELECTOR NOT FOUND ERRORS!!!
}

describe('Paint Scene tests.', () => {
  let page
  beforeAll(async () => {
    page = await global.__BROWSER__.newPage()
    await page._client.send('Emulation.clearDeviceMetricsOverride')
    await page.setViewport({ width: 1400, height: 1200 })
    // Need to hit domain first so that local storage will register - https://stackoverflow.com/questions/51789038/set-localstorage-items-before-page-loads-in-puppeteer
    await page.goto('https://localhost:8080/',
      {
        waitUntil: 'networkidle0',
        timeout: 15000
      })

    // Add colors to the live palette
    await page.evaluate((palette) => {
      window.localStorage.setItem('lp', palette)
    }, JSON.stringify(mockPalette))

    await page.goto('https://localhost:8080/templates/sw-com/sw-color-visualizer-wrapper.html#/cvw/active/scenes',
      {
        waitUntil: 'networkidle0',
        timeout: 15000
      })

    // Click through to the splash page to get to the main screen of the cvw
    await page.click(SPLASH_SCREEN_START_BTN)
  })

  // This test might look like the others but it uses first canvas data (background canvas). Right now few test are structured this way.
  it('should contain the same image as the one uploaded.', async () => {
    await loadImage(page, testImagePath1)
    const bgData = await getBackgroundCanvasData(page)

    // uncomment to save ref image
    // const { canvasImageUrl } = await getSecondCanvasData(page)
    // fs.writeFileSync(`/tmp/testImage1-ref-${Date.now()}.png`, canvasImageUrl.split(',')[1], 'base64')

    let refData = fs.readFileSync(testImagePath1, { encoding: 'base64' })
    refData = `data:image/png;base64,${refData}`

    const diff = await resemble(bgData).compareTo(refData).scaleToSameSize()

    const mismatchThreshold = 0.2
    let mismatchVal = 1.0

    await diff.onComplete(data => {
      mismatchVal = parseFloat(data.misMatchPercentage)
    })

    expect(mismatchVal).toBeLessThanOrEqual(mismatchThreshold)
  })

  it('It should scale when resized', async () => {
    const bgDataBefore = await getBackgroundCanvasData(page)

    await page.setViewport({ width: 1000, height: 1000 })

    const bgDataAfter = await getBackgroundCanvasData(page)

    const diff = await resemble(bgDataBefore).compareTo(bgDataAfter)

    const matchThreshold = 0.01
    let mismatchVal = 1.0

    await diff.onComplete(data => {
      mismatchVal = parseFloat(data.misMatchPercentage)
    })

    expect(mismatchVal).toBeLessThanOrEqual(matchThreshold)
  })

  it('should fill the top left black box with melon.', async () => {
    const paintWrapperCoords = await loadImage(page, checkeredTestImagePath, true)

    // This should click the center of the first checkered square
    await page.mouse.click(paintWrapperCoords.x + 50, paintWrapperCoords.y + 50)
    // wait for fill to complete
    await page.waitFor(5000)

    const matchThreshold = 0.2
    const { mismatchVal } = await getMismatch(page, checkeredTestRefImagePath, matchThreshold)

    // @todo Right now this one fails now because the flood fill is not working correctly -RS 6/17/20
    await expect(mismatchVal).toBeLessThanOrEqual(matchThreshold)
  })

  it('Should draw a trapezium to the screen', async () => {
    const paintWrapperCoords = await loadImage(page, testImagePath2, true)

    // Select define area
    await selectTool(page, TOOL_ENUM.defineArea)

    // select melon color
    await selectColor(page, COLOR_ENUM.melon)

    const { x, y } = paintWrapperCoords

    // Draw trapezium
    const points = [{ x: x + 300, y: y + 200 }, { x: x + 500, y: y + 200 }, { x: x + 600, y: y + 300 }, { x: x + 200, y: y + 300 }]
    await createPolygon(page, points)

    const matchThreshold = 0.2
    const { mismatchVal } = await getMismatch(page, polygonRefPath, matchThreshold)

    // Uncomment this line to generate ref file for test.
    // const { canvasImageUrl } = await getSecondCanvasData(page)
    // fs.writeFileSync(`/tmp/polygon-ref-${Date.now()}.png`, canvasImageUrl.split(',')[1], 'base64')

    expect(mismatchVal).toBeLessThan(matchThreshold)
  })

  it('Should draw a melon dot and horizontal line with a vertical pink line .', async () => {
    const paintWrapperCoords = await loadImage(page, testImagePath2, true)
    await page.waitFor(300)
    // Select paint brush
    await selectTool(page, TOOL_ENUM.paintBrush)

    // Painting a dot first seems to make this more reliable
    page.mouse.click(225, 275)
    // Default (melon) color across
    await page.waitFor(2000)
    await drawLineFromLeftToRight(page, paintWrapperCoords, 50, 150, 50, 0)
    await page.waitFor(2000)
    // Select pink down
    await selectColor(page, COLOR_ENUM.erosPink)

    await drawLineFromLeftToRight(page, paintWrapperCoords, 150, 50, 0, 50)
    await page.waitFor(2000)

    const matchThreshold = 0.02
    /* The two-line-dot-ref.png is an ideal test reference.  We cannot use it since a bug in headless chrome doesn't allow lines to be consistently drawn.
    The test has been simplified to simply check if something was drawn. This should be sufficient, thus we use the blank-ref.png.
     */
    const { mismatchVal } = await getMismatch(page, blankRefPath, matchThreshold)

    expect(mismatchVal).toBeGreaterThan(matchThreshold)
  })

  it('Should draw and erase and a trapezium', async () => {
    const paintWrapperCoords = await loadImage(page, testImagePath1, true)
    // select define area tool
    await selectTool(page, TOOL_ENUM.defineArea)

    // ensure melon color is selected
    await selectColor(page, COLOR_ENUM.melon)

    const blankCanvasImageUrl = await getSecondCanvasData(page)

    const { x, y } = paintWrapperCoords

    // Draw trapezium
    const points = [{ x: x + 300, y: y + 200 }, { x: x + 500, y: y + 200 }, { x: x + 600, y: y + 300 }, { x: x + 200, y: y + 300 }]
    await createPolygon(page, points)

    // select remove area
    await selectTool(page, TOOL_ENUM.removeArea)

    // Draw selection to remove
    const selectPoints = [{ x: x + 50, y: y + 50 }, { x: x + 600, y: y + 50 }, { x: x + 600, y: y + 400 }, { x: x + 50, y: y + 400 }]
    await createPolygon(page, selectPoints)

    const erasedCanvasImageUrl = await getSecondCanvasData(page)

    const matchThreshold = 0.2
    let mismatchVal = matchThreshold
    const diff = await resemble(blankCanvasImageUrl).compareTo(erasedCanvasImageUrl)

    // Since we are comparing a blank canvas to a painted one the mismatch should be low value
    await diff.onComplete(data => {
      mismatchVal = parseFloat(data.misMatchPercentage)
    })

    expect(mismatchVal).toBeLessThan(matchThreshold)
  })

  it('Should partially erase the drawn shapes.', async () => {
    const paintWrapperCoords = await loadImage(page, testImagePath2, true)
    const { x, y } = paintWrapperCoords

    // select define area tool
    await selectTool(page, TOOL_ENUM.defineArea)

    // ensure melon color is selected
    await selectColor(page, COLOR_ENUM.melon)

    // create tall rectangle
    const tallPoints = [{ x: x + 300, y: y + 50 }, { x: x + 400, y: y + 50 }, { x: x + 400, y: y + 400 }, { x: x + 300, y: y + 400 }]
    await createPolygon(page, tallPoints)

    // select spa color so that we can visibly se the difference in shapes
    await selectColor(page, COLOR_ENUM.spa)

    // tool should still be selected...draw long spa colored rect
    const longPoints = [{ x: x + 200, y: y + 200 }, { x: x + 500, y: y + 200 }, { x: x + 500, y: y + 300 }, { x: x + 200, y: y + 300 }]
    await createPolygon(page, longPoints)

    // Select erase tool
    await selectTool(page, TOOL_ENUM.erase)

    // erase a part of the melon tall rect
    await page.mouse.click(x + 350, y + 100)

    const matchThreshold = 0.2

    const { mismatchVal } = await getMismatch(page, twoRectEraseRef, matchThreshold)

    // uncomment to create ref image.
    // const { canvasImageUrl} = getSecondCanvasData(page)
    // fs.writeFileSync(`/tmp/two-rect-erase-ref-${Date.now()}.png`, canvasImageUrl.split(',')[1], 'base64')

    expect(mismatchVal).toBeLessThan(matchThreshold)
  })

  it('Should paint a dot with each brush size.', async () => {
    const paintWrapperCoords = await loadImage(page, testImagePath2, true)
    const { x, y } = paintWrapperCoords

    // select spa color so that we can visibly se the difference in shapes
    await selectColor(page, COLOR_ENUM.spa)

    // select brush
    await selectTool(page, TOOL_ENUM.paintBrush)

    // The first brush is selected by default, just go ahead and paint with it...
    await page.mouse.click(x + 50, y + 100)
    await page.waitFor(2000)

    // @todo I have no idea why but pulling these selector strings in this loop up to the top of the module makes failure almost certain. -RS
    for (let i = 0; i < 7; i++) {
      const xOffset = 100 + (i * 50)
      const brushIndex = i + 2
      // select brush click of the tool to make this more predictable
      await page.click('body > div > div > div.cvw__root-container > div.cvw__root-container__nav-wrapper > div.cvw__root-wrapper > div:nth-child(1) > div > div > div.paint__scene__wrapper.paint__scene__wrapper--disable-text-select.paint__scene__wrapper--hide-cursor > div > div.paint-tool-bar__wrapper > div.paint-tool-bar__tools-container > button:nth-child(1)')
      await page.waitFor(300)
      await page.click('body > div > div > div.cvw__root-container > div.cvw__root-container__nav-wrapper > div.cvw__root-wrapper > div:nth-child(1) > div > div > div.paint__scene__wrapper > div > div.paint-tool-bar__wrapper > div.paint-tool-bar__tools-container > button:nth-child(2)')
      await page.waitFor(300)
      // Click brush 2nd largest
      await page.click(`body > div > div > div.cvw__root-container > div.cvw__root-container__nav-wrapper > div.cvw__root-wrapper > div:nth-child(1) > div > div > div.paint__scene__wrapper.paint__scene__wrapper--disable-text-select.paint__scene__wrapper--hide-cursor > div > div.paint-tool-bar__wrapper > div.paint-tool-bar__tools-container > div.paint-tool-bar__brush-types.paint-tool-bar__brush-types--show.paint-tool-bar__brush-types-paint.paint-tool-bar__brush-types--show-by-opacity > div > div.brush-types__shapes-container > div:nth-child(${brushIndex})`)
      await page.waitFor(300)
      await page.mouse.click(x + xOffset, y + 100)
      await page.waitFor(2000)
    }

    const matchThreshold = 0.02

    const { mismatchVal } = await getMismatch(page, brushesImageRef, matchThreshold)
    // uncomment to create ref image.
    // const { canvasImageUrl } = await getSecondCanvasData(page)
    // fs.writeFileSync(`/tmp/brushes-ref-${Date.now()}.png`, canvasImageUrl.split(',')[1], 'base64')

    expect(mismatchVal).toBeLessThan(matchThreshold)
  })

  it('Should draw and select a triangle to test the selection feature.', async () => {
    const paintWrapperCoords = await loadImage(page, testImagePath1, true)
    const { x, y } = paintWrapperCoords

    // select pink color
    await selectColor(page, COLOR_ENUM.erosPink)

    // select define area tool
    await selectTool(page, TOOL_ENUM.defineArea)

    const points = [{ x: x + 300, y: y + 50 }, { x: x + 425, y: y + 350 }, { x: x + 175, y: y + 350 }]
    await createPolygon(page, points)

    // Select select tool
    await selectTool(page, TOOL_ENUM.select)

    await page.mouse.click(x + 300, y + 175)
    await page.waitFor(2000)

    const matchThreshold = 0.02
    // uncomment to save ref file
    // const { canvasImageUrl } = await getSecondCanvasData(page)
    // fs.writeFileSync(`/tmp/select-triangle-ref-${Date.now()}.png`, canvasImageUrl.split(',')[1], 'base64')

    const { mismatchVal } = await getMismatch(page, selectTriangleImageRef, matchThreshold)

    expect(mismatchVal).toBeLessThan(matchThreshold)
  })

  it('Should not show selection around shape after deleted is undone.', async () => {
    const paintWrapperCoords = await loadImage(page, testImagePath1, true)
    const { x, y } = paintWrapperCoords

    // select honey bee color
    await selectColor(page, COLOR_ENUM.honeyBees)

    // select define area tool
    await selectTool(page, TOOL_ENUM.defineArea)

    // Draw square
    const points = [{ x: x + 200, y: y + 50 }, { x: x + 500, y: y + 50 }, { x: x + 500, y: y + 350 }, { x: x + 200, y: y + 350 }]
    await createPolygon(page, points)

    // uncomment the lines below to generate the ref image, getMisMatch is just used to get the ref data in this case
    // const { canvasImageUrl } = await getSecondCanvasData(page)
    // fs.writeFileSync(`/tmp/select-square-ref-${Date.now()}.png`, canvasImageUrl.split(',')[1], 'base64')

    // Select select area tool
    await selectTool(page, TOOL_ENUM.select)

    await page.mouse.click(x + 350, y + 200)
    await page.waitFor(300)

    // Delete it by clicking on the delete button
    await deleteSelection(page)

    // Undo
    await undo(page)

    const matchThreshold = 0.02
    const { mismatchVal } = await getMismatch(page, selectSquareImageRef, matchThreshold)

    expect(mismatchVal).toBeLessThan(matchThreshold)
  })
})
