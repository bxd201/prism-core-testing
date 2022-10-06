import React, { useState } from 'react'
import { faRedo, faUndo } from '@fortawesome/pro-light-svg-icons'
import { faDotCircle } from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import portrait2 from '../../test-utils/images/portrait2.jpg'
import ImageRotator from './image-rotator'

const Template = (args): JSX.Element => {
  const [acceptTerms, setAcceptTerms] = useState(false)
  const { modalView } = args

  return (
    <ImageRotator className='flex justify-center items-center' imageMetadata={args.imageMetadata}>
      {!modalView && (
        <>
          <ImageRotator.Button
            className='absolute top-0 right-0 z-10 m-7 px-7 py-2 text-sm border border-black bg-white uppercase'
            onClick={args['ImageRotator.Button (onClick)']}
          >
            close
          </ImageRotator.Button>
          <ImageRotator.Image />
        </>
      )}
      <div className={`flex flex-col items-center${!modalView ? ' absolute' : ''} bg-primaryBg`}>
        {modalView && (
          <div className='m-7 mb-0'>
            <ImageRotator.Image fitContainer />
          </div>
        )}
        <p className='m-5'>Use these arrows to rotate your image.</p>
        <ImageRotator.RotateControls className='flex justify-center gap-2'>
          {(onRotateLeftClick, onRotateRightClick) => (
            <>
              <button aria-label='anticlockwise' onClick={onRotateLeftClick}>
                <FontAwesomeIcon className='text-4xl mr-1.5' icon={faUndo} />
              </button>
              <button aria-label='clockwise' onClick={onRotateRightClick}>
                <FontAwesomeIcon className='text-4xl ml-1.5' icon={faRedo} />
              </button>
            </>
          )}
        </ImageRotator.RotateControls>
        {!modalView ? (
          <div className='flex justify-center items-center m-4.5'>
            <label aria-label='accept term' tabIndex={0}>
              <FontAwesomeIcon icon={faDotCircle} style={{ color: acceptTerms ? '#2cabe1' : '#e5e5e5' }} size='lg' />
              <input
                className='hidden'
                type='checkbox'
                checked={acceptTerms}
                onChange={() => setAcceptTerms((prev) => !prev)}
              />
            </label>
            <span className='ml-2'>I accept Terms of Use</span>
          </div>
        ) : (
          <br />
        )}
        <div className='flex gap-3'>
          {modalView && (
            <ImageRotator.Button
              className='mb-5 px-5 py-2 text-sm border border-black uppercase'
              onClick={args['ImageRotator.Button (onClick)']}
            >
              cancel
            </ImageRotator.Button>
          )}
          <ImageRotator.Button
            className={`mb-5 px-7 py-2 text-sm border ${
              modalView || acceptTerms ? 'border-black' : 'border-gray text-gray-300'
            } bg-white uppercase`}
            disabled={!modalView && !acceptTerms}
            onClick={args['ImageRotator.Button (onClick)']}
          >
            done
          </ImageRotator.Button>
        </div>
      </div>
    </ImageRotator>
  )
}

const landscapeImageMetadata = {
  landscapeHeight: 640,
  landscapeWidth: 1059,
  originalImageHeight: 725,
  originalImageWidth: 1200,
  originalIsPortrait: false,
  url: 'https://sherwin.scene7.com/is/image/sw?src=ir{swRender/hd_livingroom2?wid=1200}&qlt=92'
}

const portraitImageMetadata = {
  originalImageHeight: 800,
  originalImageWidth: 553,
  originalIsPortrait: true,
  portraitHeight: 640,
  portraitWidth: 442,
  url: portrait2
}

export const BackgroundImageLandscape = Template.bind({})
BackgroundImageLandscape.args = { imageMetadata: landscapeImageMetadata, modalView: false }

export const ModalImagePortrait = Template.bind({})
ModalImagePortrait.args = { imageMetadata: portraitImageMetadata, modalView: true }

export default {
  title: 'Components/ImageRotator',
  component: ImageRotator,
  argTypes: {
    className: { control: false },
    imageMetadata: { description: 'Processed image metadata with url and their dimensions' },
    'ImageRotator.Button': {
      description: 'compound component for interaction button (props: `className`, `disabled`, and `onClick` )'
    },
    'ImageRotator.Button (onClick)': {
      action: 'ImageRotator.Button (onClick)',
      description: 'Rotated ImageMetadata callback function fired when button is clicked'
    },
    'ImageRotator.Image': { description: 'compound component to render image (props: `className` and `fitContainer`)' },
    'ImageRotator.Image (fitContainer)': { description: 'fits image on parent container' },
    'ImageRotator.RotateControls': {
      description: 'compound component callback function to control image rotation (props: `className` )'
    },
    modalView: { description: 'places image inside the modal <br /> `storybook args only`' }
  }
}
