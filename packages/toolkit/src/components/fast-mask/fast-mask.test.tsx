import React from 'react'
import { fireEvent, render, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react'
import FastMaskView, {
  TEST_ID_1,
  TEST_ID_1_CHILD,
  TEST_ID_ALT_SPINNER,
  TEST_ID_LOADING_BG,
  TEST_ID_LOADING_MSG,
  TEST_ID_PRELOADER,
  TEST_ID_TINT_WRAPPER
} from './fast-mask'
import {
  API_URL,
  API_URL_ERR,
  API_URL_FAIL_BLOB,
  API_URL_NO_MASK,
  COLOR_1,
  CONTENT,
  PAYLOAD_200,
  PAYLOAD_FAIL_BLOB,
  PAYLOAD_NO_MASK,
  REF_DIMS,
  SAVE_DATA
} from '../../test-utils/mocked-endpoints/fast-mask-mock-data'
import { setupServer } from 'msw/node'
import { rest } from 'msw'
import { TEST_ID_OUTER as TEST_ID_CIRCLE } from '../circle-loader/circle-loader'
import { createScenesAndVariants, prepareData } from './fast-mask-utils'
import { createMiniColorFromColor } from '../../utils/tintable-scene'
import { SCENE_TYPES } from '../../constants'
const TEST_IMG_URL = 'https://sherwin.scene7.com/is/image/foo.jpg'
const TEST_IMG_URL_ERROR = 'https://sherwin.scene7.com/is/image/error.jpg'
const AWS_IMG_URL = 'https://s3.us-east-2.amazonaws.com/sw-prism-fastmask/static/files/img.jpg'
const AWS_IMG_FAIL_URL = 'https://s3.us-east-2.amazonaws.com/sw-prism-fastmask/static/files/fail.jpg'

const IMAGE = 'image'
const WIDTH = 42
const HEIGHT = 105
const SURFACE = 'surface'

const getImgReq = rest.get(TEST_IMG_URL, (req, res, ctx) => {
  return res(
    ctx.json({
      data: new Blob([])
    })
  )
})

const getImgErrorReq = rest.get(TEST_IMG_URL_ERROR, (req, res, ctx) => {
  return res(ctx.status(500))
})

const postImgReq = rest.post(API_URL, (req, res, ctx) => {
  return res(ctx.json(PAYLOAD_200))
})

const postMissingMaskReq = rest.post(API_URL_NO_MASK, (req, res, ctx) => {
  return res(ctx.json(PAYLOAD_NO_MASK))
})

const postImgErrorReq = rest.post(API_URL_ERR, (req, res, ctx) => {
  return res(ctx.status(500))
})

const postImgFailBlobReq = rest.post(API_URL_FAIL_BLOB, (req, res, ctx) => {
  return res(ctx.json(PAYLOAD_FAIL_BLOB))
})

const awsGetReq = rest.get(AWS_IMG_URL, (req, res, ctx) => {
  return res(ctx.body(new Blob([])))
})

const awsGetFailReq = rest.get(AWS_IMG_FAIL_URL, (req, res, ctx) => {
  return res(ctx.body(''))
})

const handlers = [
  getImgReq,
  getImgErrorReq,
  postImgReq,
  postImgErrorReq,
  postMissingMaskReq,
  postImgFailBlobReq,
  awsGetReq,
  awsGetFailReq
]
const server = setupServer(...handlers)

beforeAll(() => {
  server.listen()
})
beforeEach(() => {
  jest.clearAllMocks()
  server.resetHandlers()
})
afterAll(() => {
  server.close()
})

describe('FastMask View', () => {
  test('Preloader image element should NOT be in the DOM if refDims are not provided', () => {
    const handleSceneBlobError = jest.fn(() => undefined)
    const handleError = jest.fn(() => undefined)
    const handleUpdates = jest.fn(() => undefined)
    const cleanupCallback = jest.fn(() => undefined)

    render(
      <FastMaskView
        apiUrl={API_URL}
        handleSceneBlobLoaderError={handleSceneBlobError}
        refDims={REF_DIMS}
        imageUrl={TEST_IMG_URL}
        activeColor={COLOR_1}
        handleUpdates={handleUpdates}
        cleanupCallback={cleanupCallback}
        handleError={handleError}
        content={CONTENT}
      />
    )
    const preloader = screen.queryByTestId(TEST_ID_PRELOADER)
    expect(preloader).toBe(null)
  })

  test('Preloader image element should be in the DOM if refDims is provided', () => {
    const handleSceneBlobError = jest.fn(() => undefined)
    const handleError = jest.fn(() => undefined)
    const handleUpdates = jest.fn(() => undefined)
    const cleanupCallback = jest.fn(() => undefined)

    render(
      <FastMaskView
        apiUrl={API_URL}
        handleSceneBlobLoaderError={handleSceneBlobError}
        refDims={null}
        imageUrl={TEST_IMG_URL}
        activeColor={COLOR_1}
        handleUpdates={handleUpdates}
        cleanupCallback={cleanupCallback}
        handleError={handleError}
        content={CONTENT}
      />
    )
    const preloader = screen.queryByTestId(TEST_ID_PRELOADER)
    expect(preloader).toBeInTheDocument()
  })

  test('Loading messages should NOT appear when LoadingMessages is unspecified', async () => {
    const handleSceneBlobError = jest.fn(() => undefined)
    const handleError = jest.fn(() => undefined)
    const handleUpdates = jest.fn(() => undefined)
    const cleanupCallback = jest.fn(() => undefined)

    render(
      <FastMaskView
        apiUrl={API_URL}
        handleSceneBlobLoaderError={handleSceneBlobError}
        refDims={REF_DIMS}
        imageUrl={TEST_IMG_URL}
        activeColor={COLOR_1}
        handleUpdates={handleUpdates}
        cleanupCallback={cleanupCallback}
        handleError={handleError}
        content={CONTENT}
      />
    )

    const loading = screen.queryByTestId(TEST_ID_LOADING_MSG)
    expect(loading).not.toBeInTheDocument()
  })

  test('Loading messages should appear when LoadingMessages is specified', async () => {
    const handleSceneBlobError = jest.fn(() => undefined)
    const handleError = jest.fn(() => undefined)
    const handleUpdates = jest.fn(() => undefined)
    const cleanupCallback = jest.fn(() => undefined)

    render(
      <FastMaskView
        apiUrl={API_URL}
        handleSceneBlobLoaderError={handleSceneBlobError}
        refDims={REF_DIMS}
        imageUrl={TEST_IMG_URL}
        activeColor={COLOR_1}
        handleUpdates={handleUpdates}
        cleanupCallback={cleanupCallback}
        handleError={handleError}
        content={CONTENT}
        loadingMessage={['foobar']}
      />
    )

    const loading = screen.queryByTestId(TEST_ID_LOADING_MSG)
    expect(loading).toBeInTheDocument()
  })

  test('Spinner should not appear in document after the dat ais loaded', async () => {
    const handleSceneBlobError = jest.fn(() => undefined)
    const handleError = jest.fn(() => undefined)
    const handleUpdates = jest.fn(() => undefined)
    const cleanupCallback = jest.fn(() => undefined)

    render(
      <FastMaskView
        apiUrl={API_URL}
        handleSceneBlobLoaderError={handleSceneBlobError}
        refDims={REF_DIMS}
        imageUrl={TEST_IMG_URL}
        activeColor={COLOR_1}
        handleUpdates={handleUpdates}
        cleanupCallback={cleanupCallback}
        handleError={handleError}
        content={CONTENT}
      />
    )

    const spinner = await screen.queryByTestId(TEST_ID_ALT_SPINNER)
    expect(spinner).not.toBeInTheDocument()
  })

  test('Spinner should appear while component is initiating', async () => {
    const handleSceneBlobError = jest.fn(() => undefined)
    const handleError = jest.fn(() => undefined)
    const handleUpdates = jest.fn(() => undefined)
    const cleanupCallback = jest.fn(() => undefined)

    render(
      <FastMaskView
        apiUrl={API_URL}
        handleSceneBlobLoaderError={handleSceneBlobError}
        refDims={REF_DIMS}
        imageUrl={TEST_IMG_URL}
        activeColor={COLOR_1}
        handleUpdates={handleUpdates}
        cleanupCallback={cleanupCallback}
        handleError={handleError}
        content={CONTENT}
      />
    )

    const spinner = await screen.findByTestId(TEST_ID_CIRCLE)
    expect(spinner).toBeInTheDocument()
  })

  test('Spinner should appear while component is initiating', async () => {
    const handleSceneBlobError = jest.fn(() => undefined)
    const handleError = jest.fn(() => undefined)
    const handleUpdates = jest.fn(() => undefined)
    const cleanupCallback = jest.fn(() => undefined)

    render(
      <FastMaskView
        apiUrl={API_URL}
        handleSceneBlobLoaderError={handleSceneBlobError}
        refDims={REF_DIMS}
        imageUrl={TEST_IMG_URL}
        activeColor={COLOR_1}
        handleUpdates={handleUpdates}
        cleanupCallback={cleanupCallback}
        handleError={handleError}
        content={CONTENT}
      />
    )

    const spinner = await screen.findByTestId(TEST_ID_CIRCLE)
    expect(spinner).toBeInTheDocument()
  })

  test('Expect empty content to be in the document when unspecified', async () => {
    const handleSceneBlobError = jest.fn(() => undefined)
    const handleError = jest.fn(() => undefined)
    const handleUpdates = jest.fn(() => undefined)
    const cleanupCallback = jest.fn(() => undefined)

    render(
      <FastMaskView
        apiUrl={API_URL}
        handleSceneBlobLoaderError={handleSceneBlobError}
        refDims={REF_DIMS}
        imageUrl={TEST_IMG_URL}
        activeColor={COLOR_1}
        handleUpdates={handleUpdates}
        cleanupCallback={cleanupCallback}
        handleError={handleError}
        content={CONTENT}
      />
    )

    const loadingBg = await screen.findByTestId(TEST_ID_LOADING_BG)
    expect(loadingBg).toBeInTheDocument()
    expect(loadingBg).toHaveAttribute('alt', CONTENT.userUploadAlt)
  })

  test('Tinter should appear after the service has been called', async () => {
    const handleSceneBlobError = jest.fn(() => undefined)
    const handleError = jest.fn(() => undefined)
    const handleUpdates = jest.fn(() => undefined)
    const cleanupCallback = jest.fn(() => undefined)

    render(
      <FastMaskView
        apiUrl={API_URL}
        handleSceneBlobLoaderError={handleSceneBlobError}
        refDims={REF_DIMS}
        imageUrl={TEST_IMG_URL}
        activeColor={COLOR_1}
        handleUpdates={handleUpdates}
        cleanupCallback={cleanupCallback}
        handleError={handleError}
        content={CONTENT}
        savedData={SAVE_DATA}
      />
    )

    const tintWrapper = await screen.findByTestId(TEST_ID_TINT_WRAPPER)
    expect(tintWrapper).toBeInTheDocument()
  })

  test('Image priming should be triggered if flag is set', async () => {
    const handleSceneBlobError = jest.fn(() => undefined)
    const handleError = jest.fn(() => undefined)
    const handleUpdates = jest.fn(() => undefined)
    const cleanupCallback = jest.fn(() => undefined)

    render(
      <FastMaskView
        apiUrl={API_URL}
        handleSceneBlobLoaderError={handleSceneBlobError}
        refDims={REF_DIMS}
        imageUrl={TEST_IMG_URL}
        activeColor={COLOR_1}
        handleUpdates={handleUpdates}
        cleanupCallback={cleanupCallback}
        handleError={handleError}
        content={CONTENT}
        savedData={SAVE_DATA}
        shouldPrimeImage={true}
      />
    )

    // Ideally I would check for TEST_ID but, I cannot get past the need for real blobs to be processed -RS
    const wrapper = await screen.findByTestId(TEST_ID_1)
    expect(wrapper).toBeInTheDocument()
  })

  test('Preprocessing should be bypassed if pickled data passed to component', async () => {
    const handleSceneBlobError = jest.fn(() => undefined)
    const handleError = jest.fn(() => undefined)
    const handleUpdates = jest.fn(() => undefined)
    const cleanupCallback = jest.fn(() => undefined)

    render(
      <FastMaskView
        apiUrl={API_URL}
        handleSceneBlobLoaderError={handleSceneBlobError}
        refDims={REF_DIMS}
        imageUrl={TEST_IMG_URL}
        activeColor={COLOR_1}
        handleUpdates={handleUpdates}
        cleanupCallback={cleanupCallback}
        handleError={handleError}
        content={CONTENT}
        savedData={SAVE_DATA}
        shouldPrimeImage={true}
        showSpinner={false}
      />
    )

    // Ideally I would check for TEST_ID but, I cannot get past the need for real blobs to be processed -RS
    const wrapper = await screen.findByTestId(TEST_ID_1)
    expect(wrapper).toBeInTheDocument()
  })

  test('Layout should be modified for CVW if flag set', async () => {
    const handleSceneBlobError = jest.fn(() => undefined)
    const handleError = jest.fn(() => undefined)
    const handleUpdates = jest.fn(() => undefined)
    const cleanupCallback = jest.fn(() => undefined)

    render(
      <FastMaskView
        apiUrl={API_URL}
        handleSceneBlobLoaderError={handleSceneBlobError}
        refDims={REF_DIMS}
        imageUrl={TEST_IMG_URL}
        activeColor={COLOR_1}
        handleUpdates={handleUpdates}
        cleanupCallback={cleanupCallback}
        handleError={handleError}
        content={CONTENT}
        savedData={SAVE_DATA}
        shouldPrimeImage={true}
        showSpinner={false}
        isForCVW={true}
      />
    )

    const wrapper = await screen.findByTestId(TEST_ID_1_CHILD)
    expect(wrapper).toHaveClass('min-h-[400px]')
  })

  test('Component should gracefully handle an near-impossible blob load error', async () => {
    const handleSceneBlobError = jest.fn(() => undefined)
    const handleError = jest.fn(() => undefined)
    const handleUpdates = jest.fn(() => undefined)
    const cleanupCallback = jest.fn(() => undefined)
    const consoleErrorSpy = jest.spyOn(console, 'error')
    // Quiet expected output
    consoleErrorSpy.mockImplementation(() => undefined)

    render(
      <FastMaskView
        apiUrl={API_URL}
        handleSceneBlobLoaderError={handleSceneBlobError}
        refDims={REF_DIMS}
        imageUrl={TEST_IMG_URL_ERROR}
        activeColor={COLOR_1}
        handleUpdates={handleUpdates}
        cleanupCallback={cleanupCallback}
        handleError={handleError}
        content={CONTENT}
        shouldPrimeImage={true}
      />
    )

    await waitFor(() => expect(consoleErrorSpy).toHaveBeenCalledTimes(1))
  })

  test('InitHandler should be called if specified', async () => {
    const handleSceneBlobError = jest.fn(() => undefined)
    const handleError = jest.fn(() => undefined)
    const handleUpdates = jest.fn(() => undefined)
    const cleanupCallback = jest.fn(() => undefined)
    const initHandler = jest.fn(() => undefined)

    render(
      <FastMaskView
        apiUrl={API_URL}
        handleSceneBlobLoaderError={handleSceneBlobError}
        refDims={REF_DIMS}
        imageUrl={TEST_IMG_URL}
        activeColor={COLOR_1}
        handleUpdates={handleUpdates}
        cleanupCallback={cleanupCallback}
        handleError={handleError}
        content={CONTENT}
        initHandler={initHandler}
      />
    )

    await waitFor(() => expect(initHandler).toHaveBeenCalledTimes(1))
  })

  test('Update handler should be called after fask mask successfully responds', async () => {
    const handleSceneBlobError = jest.fn(() => undefined)
    const handleError = jest.fn(() => undefined)
    const handleUpdates = jest.fn(() => undefined)
    const cleanupCallback = jest.fn(() => undefined)
    const initHandler = jest.fn(() => undefined)

    render(
      <FastMaskView
        apiUrl={API_URL}
        handleSceneBlobLoaderError={handleSceneBlobError}
        refDims={REF_DIMS}
        imageUrl={TEST_IMG_URL}
        activeColor={COLOR_1}
        handleUpdates={handleUpdates}
        cleanupCallback={cleanupCallback}
        handleError={handleError}
        content={CONTENT}
        savedData={SAVE_DATA}
        shouldPrimeImage={true}
        showSpinner={false}
        isForCVW={true}
        initHandler={initHandler}
      />
    )

    await waitFor(() => expect(handleUpdates).toHaveBeenCalledTimes(1))
  })

  test('SceneBlob handler should be called if there is an error created blob urls', async () => {
    const handleSceneBlobError = jest.fn(() => undefined)
    const handleError = jest.fn(() => undefined)
    const handleUpdates = jest.fn(() => undefined)
    const cleanupCallback = jest.fn(() => undefined)

    render(
      <FastMaskView
        apiUrl={API_URL_FAIL_BLOB}
        handleSceneBlobLoaderError={handleSceneBlobError}
        refDims={REF_DIMS}
        imageUrl={TEST_IMG_URL}
        activeColor={COLOR_1}
        handleUpdates={handleUpdates}
        cleanupCallback={cleanupCallback}
        handleError={handleError}
        showSpinner={false}
        content={CONTENT}
      />
    )

    await waitFor(() => expect(handleSceneBlobError).toHaveBeenCalledTimes(1))
  })

  test('Generic error handler should be called if there is a ml service error 500', async () => {
    const handleSceneBlobError = jest.fn(() => undefined)
    const handleError = jest.fn(() => undefined)
    const handleUpdates = jest.fn(() => undefined)
    const cleanupCallback = jest.fn(() => undefined)
    const consoleErrorSpy = jest.spyOn(console, 'error')
    // Quiet expected output
    consoleErrorSpy.mockImplementation(() => undefined)

    render(
      <FastMaskView
        apiUrl={API_URL_ERR}
        handleSceneBlobLoaderError={handleSceneBlobError}
        refDims={REF_DIMS}
        imageUrl={TEST_IMG_URL}
        activeColor={COLOR_1}
        handleUpdates={handleUpdates}
        cleanupCallback={cleanupCallback}
        handleError={handleError}
        content={CONTENT}
        shouldPrimeImage={true}
        showSpinner={false}
        isForCVW={true}
      />
    )

    await waitFor(() => expect(handleError).toHaveBeenCalledTimes(1))
  })

  test('Generic error handler should be called if ml service has malformed data', async () => {
    const handleSceneBlobError = jest.fn(() => undefined)
    const handleError = jest.fn(() => undefined)
    const handleUpdates = jest.fn(() => undefined)
    const cleanupCallback = jest.fn(() => undefined)
    const consoleErrorSpy = jest.spyOn(console, 'error')
    // Quiet expected output
    consoleErrorSpy.mockImplementation(() => undefined)

    render(
      <FastMaskView
        apiUrl={API_URL_NO_MASK}
        handleSceneBlobLoaderError={handleSceneBlobError}
        refDims={REF_DIMS}
        imageUrl={TEST_IMG_URL}
        activeColor={COLOR_1}
        handleUpdates={handleUpdates}
        cleanupCallback={cleanupCallback}
        handleError={handleError}
        content={CONTENT}
        shouldPrimeImage={true}
        showSpinner={false}
        isForCVW={true}
      />
    )

    await waitFor(() => expect(handleError).toHaveBeenCalledTimes(1))
    expect(consoleErrorSpy.mock.calls[0][0]).toBe('issue with segmentation: ')
  })

  test('Generic error handler just log error if ml service has malformed data and there is no error handler', async () => {
    const handleSceneBlobError = jest.fn(() => undefined)
    const handleUpdates = jest.fn(() => undefined)
    const cleanupCallback = jest.fn(() => undefined)
    const consoleErrorSpy = jest.spyOn(console, 'error')
    // Quiet expected output
    consoleErrorSpy.mockImplementation(() => undefined)

    render(
      <FastMaskView
        apiUrl={API_URL_NO_MASK}
        handleSceneBlobLoaderError={handleSceneBlobError}
        refDims={REF_DIMS}
        imageUrl={TEST_IMG_URL}
        activeColor={COLOR_1}
        handleUpdates={handleUpdates}
        cleanupCallback={cleanupCallback}
        content={CONTENT}
        shouldPrimeImage={true}
        showSpinner={false}
        isForCVW={true}
      />
    )

    await waitFor(() => expect(consoleErrorSpy.mock.calls[0][0]).toBe('issue with segmentation: '))
  })

  test('Preloader should be removed after it loads the image', async () => {
    const handleSceneBlobError = jest.fn(() => undefined)
    const handleUpdates = jest.fn(() => undefined)
    const cleanupCallback = jest.fn(() => undefined)
    const consoleErrorSpy = jest.spyOn(console, 'error')
    // Quiet expected output
    consoleErrorSpy.mockImplementation(() => undefined)

    render(
      <FastMaskView
        apiUrl={API_URL}
        handleSceneBlobLoaderError={handleSceneBlobError}
        imageUrl={TEST_IMG_URL}
        activeColor={COLOR_1}
        handleUpdates={handleUpdates}
        cleanupCallback={cleanupCallback}
        content={CONTENT}
      />
    )

    const preloader = await screen.findByTestId(TEST_ID_PRELOADER)
    fireEvent.load(preloader)
    expect(screen.queryByTestId(TEST_ID_PRELOADER)).toBe(null)
  })

  test('createScenesAndVariants should produce a valid object of type SceneAndVariant', () => {
    const x = createScenesAndVariants([[IMAGE, SURFACE]], WIDTH, HEIGHT)

    expect(x).not.toBe(null)
    expect(x.sceneUid).not.toBe(null)
    expect(x.scenes.length).toBe(1)
    expect(x.variants.length).toBe(1)
    expect(x.scenes[0].uid).toBe(x.sceneUid)
    expect(x.variants[0].sceneUid).toBe(x.sceneUid)
    expect(x.variants[0].surfaces.length).toBe(1)
  })

  test('prepareData should format saved data to fast mask type', () => {
    const VARIANT = 'foo'
    const color = createMiniColorFromColor(COLOR_1)
    const x = prepareData([IMAGE, SURFACE], WIDTH, HEIGHT, [color], VARIANT)

    expect(x).not.toBe(null)
    expect(x.image).toBe(IMAGE)
    expect(x.surfaces.length).toBe(1)
    expect(x.width).toBe(WIDTH)
    expect(x.height).toBe(HEIGHT)
    expect(x.surfaceColors.length).toBe(1)
    expect(x.sceneType).toBe(SCENE_TYPES.FAST_MASK)
  })
})
