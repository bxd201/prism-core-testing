import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { SCENE_TYPES, SCENE_VARIANTS } from '../../constants'
import { darkSlateBlueImage, darkTurquoiseImage, sw6084, sw7005 } from '../../test-utils/mock-data'
import { CustomIcon } from '../../types'
import { createMiniColorFromColor } from '../../utils/tintable-scene'
import { TEST_ID_IMAGE_QUEUE_IMAGE } from '../image-queue/image-queue'
import { TEST_ID as STS_TEST_ID } from '../simple-tintable-scene/simple-tintable-scene'
import { TEST_ID as HA_TEST_ID } from '../simple-tintable-scene/simple-tintable-scene-hit-area'
import { TEST_ID } from '../simple-tintable-scene/tintable-scene-surface'
import Toggle, { TEST_ID_CHECK, TEST_ID_ICON_0 } from '../toggle/toggle'
import SceneView, { TEST_ID_CLEAR_BTN, TEST_ID_WRAPPER } from './scene-view'

const content = { clearAreaText: 'clear button omega' }
const surfaceColors = [createMiniColorFromColor(sw6084)]
const selectedUid = 'scene-1'

const surface1 = {
  id: 1,
  role: '',
  thumb: darkTurquoiseImage,
  hitArea: darkSlateBlueImage,
  shadows: darkSlateBlueImage,
  highlights: '',
  surfaceBlobUrl: darkSlateBlueImage
}

const surface2 = {
  id: 2,
  role: '',
  thumb: darkSlateBlueImage,
  hitArea: darkTurquoiseImage,
  shadows: darkTurquoiseImage,
  highlights: '',
  surfaceBlobUrl: darkTurquoiseImage
}

const scenesCollection = [
  {
    id: 1,
    width: 400,
    height: 600,
    variantNames: [SCENE_VARIANTS.DAY, SCENE_VARIANTS.NIGHT],
    sceneType: SCENE_TYPES.ROOM,
    uid: selectedUid,
    description: 'Alpha'
  }
]

const variantsCollection = [
  {
    id: 1,
    sceneUid: selectedUid,
    sceneId: 1,
    variantName: 'Alpha Day',
    sceneType: SCENE_TYPES.ROOM,
    // blob urls are not currently set when initialized but after they have been loaded
    surfaces: [surface1],
    image: darkTurquoiseImage,
    thumb: darkSlateBlueImage,
    normalizedImageValueCurve: '',
    sceneCategories: null,
    expertColorPicks: null,
    isFirstOfKind: true
  },
  {
    id: 2,
    sceneUid: selectedUid,
    sceneId: 1,
    variantName: 'Alpha Night ',
    sceneType: SCENE_VARIANTS.NIGHT,
    // blob urls are not currently set when initialized but after they have been loaded
    surfaces: [surface2],
    image: darkSlateBlueImage,
    thumb: darkTurquoiseImage,
    normalizedImageValueCurve: '',
    sceneCategories: null,
    expertColorPicks: null,
    isFirstOfKind: true
  }
]

beforeEach(() => {
  jest.clearAllMocks()
})

describe('Scene View', () => {
  test('Clear button should appear when surface colors from parent contain at least 1 color and flag passed', async () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn')
    // Quiet expected output
    consoleWarnSpy.mockImplementation(() => undefined)

    render(
      <SceneView
        showClearButton
        surfaceColorsFromParents={surfaceColors}
        selectedSceneUid={selectedUid}
        scenesCollection={scenesCollection}
        variantsCollection={variantsCollection}
        content={content}
      />
    )

    const rootElement = await screen.queryByTestId(TEST_ID_WRAPPER)

    const imageQueueImages = await screen.queryAllByTestId(TEST_ID_IMAGE_QUEUE_IMAGE)

    imageQueueImages.forEach((img) => {
      fireEvent.load(img)
    })

    const clearBtn = await screen.queryByTestId(TEST_ID_CLEAR_BTN)
    expect(rootElement).toBeInTheDocument()
    expect(clearBtn).toBeInTheDocument()
  })

  test('Toggle should not show if flag is unset.', async () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn')
    // Quiet expected output
    consoleWarnSpy.mockImplementation(() => undefined)

    render(
      <SceneView
        surfaceColorsFromParents={surfaceColors}
        selectedSceneUid={selectedUid}
        scenesCollection={scenesCollection}
        variantsCollection={variantsCollection}
        content={content}
      />
    )

    const imageQueueImages = await screen.queryAllByTestId(TEST_ID_IMAGE_QUEUE_IMAGE)

    imageQueueImages.forEach((img) => {
      fireEvent.load(img)
    })

    const toggle = (await screen.queryByTestId(TEST_ID_CHECK)) as HTMLInputElement
    expect(toggle).not.toBeInTheDocument()
  })

  test('Toggle should not show if flag is set and only 1 variant is set.', async () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn')
    // Quiet expected output
    consoleWarnSpy.mockImplementation(() => undefined)

    render(
      <SceneView
        surfaceColorsFromParents={surfaceColors}
        selectedSceneUid={selectedUid}
        scenesCollection={scenesCollection}
        variantsCollection={[variantsCollection[0]]}
        content={content}
      />
    )

    const imageQueueImages = await screen.queryAllByTestId(TEST_ID_IMAGE_QUEUE_IMAGE)

    imageQueueImages.forEach((img) => {
      fireEvent.load(img)
    })

    const toggle = (await screen.queryByTestId(TEST_ID_CHECK)) as HTMLInputElement
    expect(toggle).not.toBeInTheDocument()
  })

  test('Init toggle should reflect the first ordinal variant and change to the second when clicked', async () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn')
    // Quiet expected output
    consoleWarnSpy.mockImplementation(() => undefined)

    render(
      <SceneView
        allowVariantSwitch
        surfaceColorsFromParents={surfaceColors}
        selectedSceneUid={selectedUid}
        scenesCollection={scenesCollection}
        variantsCollection={variantsCollection}
        content={content}
      />
    )

    const imageQueueImages = await screen.queryAllByTestId(TEST_ID_IMAGE_QUEUE_IMAGE)

    imageQueueImages.forEach((img) => {
      fireEvent.load(img)
    })

    const toggle = (await screen.queryByTestId(TEST_ID_CHECK)) as HTMLInputElement
    expect(toggle).toBeInTheDocument()
    expect(toggle.checked).toBe(false)

    fireEvent.click(toggle)

    expect(toggle.checked).toBe(true)
  })

  test('The specified variant should be displayed when explicitly set', async () => {
    const localVariant = variantsCollection[1]
    const consoleWarnSpy = jest.spyOn(console, 'warn')
    // Quiet expected output
    consoleWarnSpy.mockImplementation(() => undefined)

    render(
      <SceneView
        selectedVariantName={localVariant.variantName}
        surfaceColorsFromParents={surfaceColors}
        selectedSceneUid={selectedUid}
        scenesCollection={scenesCollection}
        variantsCollection={variantsCollection}
        content={content}
      />
    )

    const imageQueueImages = await screen.queryAllByTestId(TEST_ID_IMAGE_QUEUE_IMAGE)

    imageQueueImages.forEach((img) => {
      fireEvent.load(img)
    })

    const toggle = (await screen.queryByTestId(TEST_ID_CHECK)) as HTMLInputElement
    expect(toggle).not.toBeInTheDocument()

    const bgImage = (await screen.queryByTestId(STS_TEST_ID.BG_IMAGE)) as HTMLImageElement
    expect(bgImage.src).toBe(localVariant.image)
  })

  test('There should be no surfaces painted when parent provides no surface colors', async () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn')
    // Quiet expected output
    consoleWarnSpy.mockImplementation(() => undefined)

    render(
      <SceneView
        surfaceColorsFromParents={[]}
        selectedSceneUid={selectedUid}
        scenesCollection={scenesCollection}
        variantsCollection={variantsCollection}
        content={content}
      />
    )

    const imageQueueImages = await screen.queryAllByTestId(TEST_ID_IMAGE_QUEUE_IMAGE)

    imageQueueImages.forEach((img) => {
      fireEvent.load(img)
    })

    const tintableSurface = await screen.queryByTestId(TEST_ID.CONTAINER)
    expect(tintableSurface).not.toBeInTheDocument()
  })

  test('There should be surfaces painted when parent provides surface color(s)', async () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn')
    // Quiet expected output
    consoleWarnSpy.mockImplementation(() => undefined)

    render(
      <SceneView
        surfaceColorsFromParents={surfaceColors}
        selectedSceneUid={selectedUid}
        scenesCollection={scenesCollection}
        variantsCollection={variantsCollection}
        content={content}
      />
    )

    const imageQueueImages = await screen.queryAllByTestId(TEST_ID_IMAGE_QUEUE_IMAGE)

    imageQueueImages.forEach((img) => {
      fireEvent.load(img)
    })

    const tintableSurface = await screen.queryByTestId(TEST_ID.CONTAINER)
    expect(tintableSurface).toBeInTheDocument()
  })

  test('Thumbnails should be shown when specified', async () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn')
    // Quiet expected output
    consoleWarnSpy.mockImplementation(() => undefined)

    render(
      <SceneView
        showThumbnail
        surfaceColorsFromParents={surfaceColors}
        selectedSceneUid={selectedUid}
        scenesCollection={scenesCollection}
        variantsCollection={variantsCollection}
        content={content}
      />
    )

    const imageQueueImages = await screen.queryAllByTestId(TEST_ID_IMAGE_QUEUE_IMAGE)

    imageQueueImages.forEach((img) => {
      fireEvent.load(img)
    })

    const bgImage = (await screen.queryByTestId(STS_TEST_ID.BG_IMAGE)) as HTMLImageElement
    expect(bgImage.src).toBe(variantsCollection[0].thumb)
  })

  test('Callback should fire when surface clicked', async () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn')
    // Quiet expected output
    consoleWarnSpy.mockImplementation(() => undefined)

    const handleSurfacePainted = jest.fn(() => undefined)

    render(
      <SceneView
        interactive
        handleSurfacePaintedState={handleSurfacePainted}
        surfaceColorsFromParents={[null]}
        selectedSceneUid={selectedUid}
        scenesCollection={scenesCollection}
        variantsCollection={variantsCollection}
        content={content}
      />
    )

    const imageQueueImages = await screen.queryAllByTestId(TEST_ID_IMAGE_QUEUE_IMAGE)

    imageQueueImages.forEach((img) => {
      fireEvent.load(img)
    })

    const hitArea = await screen.queryByTestId(HA_TEST_ID.MOUSE_LISTENER)
    fireEvent.click(hitArea)
    expect(handleSurfacePainted).toHaveBeenCalledTimes(1)
  })

  test('Surface flood color should match input color', async () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn')
    // Quiet expected output
    consoleWarnSpy.mockImplementation(() => undefined)

    const handleSurfacePainted = jest.fn((uid, variants, colors) => undefined)

    render(
      <SceneView
        interactive
        handleSurfacePaintedState={handleSurfacePainted}
        surfaceColorsFromParents={surfaceColors}
        selectedSceneUid={selectedUid}
        scenesCollection={scenesCollection}
        variantsCollection={variantsCollection}
        content={content}
        livePaletteColors={{ activeColor: sw7005 }}
      />
    )

    const imageQueueImages = await screen.queryAllByTestId(TEST_ID_IMAGE_QUEUE_IMAGE)

    imageQueueImages.forEach((img) => {
      fireEvent.load(img)
    })

    const hitArea = await screen.queryByTestId(HA_TEST_ID.MOUSE_LISTENER)
    fireEvent.click(hitArea)

    const filter = await screen.queryByTestId(TEST_ID.CONTAINER)
    const feFlood = filter.getElementsByTagName('feFlood')
    expect(feFlood[0].getAttribute('flood-color')).toBe(sw7005.hex)
    expect(handleSurfacePainted.mock.calls[1][2][0].colorNumber).toBe(sw7005.colorNumber)
  })

  test('There should be no tinted surfaces after the clear button is clicked', async () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn')
    // Quiet expected output
    consoleWarnSpy.mockImplementation(() => undefined)

    const handleSurfacePainted = jest.fn((uid, variants, colors) => undefined)

    render(
      <SceneView
        interactive
        showClearButton
        handleSurfacePaintedState={handleSurfacePainted}
        surfaceColorsFromParents={surfaceColors}
        selectedSceneUid={selectedUid}
        scenesCollection={scenesCollection}
        variantsCollection={variantsCollection}
        content={content}
        livePaletteColors={{ activeColor: sw7005 }}
      />
    )

    const imageQueueImages = await screen.queryAllByTestId(TEST_ID_IMAGE_QUEUE_IMAGE)

    imageQueueImages.forEach((img) => {
      fireEvent.load(img)
    })

    const clearButton = await screen.queryByTestId(TEST_ID_CLEAR_BTN)
    expect(clearButton).toBeInTheDocument()
    fireEvent.click(clearButton)

    const clearButton2 = await screen.queryByTestId(TEST_ID_CLEAR_BTN)
    expect(clearButton2).not.toBeInTheDocument()
  })

  test('A custom toggle should be rendered instead of the default one', async () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn')
    // Quiet expected output
    consoleWarnSpy.mockImplementation(() => undefined)

    const handleSurfacePainted = jest.fn(() => undefined)
    const handleToggle = jest.fn(() => undefined)
    const variants = [{ label: 'foo' }, { label: 'bar' }] as [CustomIcon, CustomIcon]
    const customToggle = (index, list, data): JSX.Element => {
      return <Toggle handleToggle={handleToggle} itemList={variants} />
    }

    render(
      <SceneView
        allowVariantSwitch
        customToggle={customToggle}
        handleSurfacePaintedState={handleSurfacePainted}
        surfaceColorsFromParents={surfaceColors}
        selectedSceneUid={selectedUid}
        scenesCollection={scenesCollection}
        variantsCollection={variantsCollection}
        content={content}
      />
    )

    const imageQueueImages = await screen.queryAllByTestId(TEST_ID_IMAGE_QUEUE_IMAGE)

    imageQueueImages.forEach((img) => {
      fireEvent.load(img)
    })

    const toggleLabel0 = await screen.queryByTestId(TEST_ID_ICON_0)
    expect(toggleLabel0.innerHTML).toBe(variants[0].label)
  })
})
