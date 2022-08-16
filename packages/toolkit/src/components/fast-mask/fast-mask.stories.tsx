import React from 'react'
import FastMaskView, { FastMaskProps } from './fast-mask'

const color1 = {
  colorNumber: '6787',
  coordinatingColors: {
    coord1ColorId: '2837',
    coord2ColorId: '11280',
    whiteColorId: '2471'
  },
  description: ['Soft', 'Fairly Bright'],
  id: '2474',
  isExterior: true,
  isInterior: true,
  name: 'Fountain',
  lrv: 39.448,
  brandedCollectionNames: [],
  colorFamilyNames: ['Blue'],
  brandKey: 'SW',
  red: 86,
  green: 181,
  blue: 202,
  hue: 0.5301724137931034,
  saturation: 0.5225225225225224,
  lightness: 0.5647058823529412,
  hex: '#56b5ca',
  isDark: false,
  storeStripLocator: '167-C4',
  similarColors: ['2467', '11228', '2481', '2639', '2461', '2460', '2468', '2180', '2636', '2635'],
  ignore: false,
  archived: false,
  lab: {
    L: 68.96002878880431,
    A: -21.95795490141206,
    B: -19.13408386294475
  }
}

const Template = (args: FastMaskProps): JSX.Element => {
  const {
    apiUrl,
    handleSceneBlobLoaderError,
    refDims,
    imageUrl,
    activeColor,
    handleUpdates,
    cleanupCallback,
    handleError,
    content,
    shouldPrimeImage
  } = args

  return (
    <div style={{ width: '500px ' }}>
      <FastMaskView
        apiUrl={apiUrl}
        handleSceneBlobLoaderError={handleSceneBlobLoaderError}
        refDims={refDims}
        imageUrl={imageUrl}
        activeColor={activeColor}
        handleUpdates={handleUpdates}
        cleanupCallback={cleanupCallback}
        handleError={handleError}
        content={content}
        shouldPrimeImage={shouldPrimeImage}
      />
    </div>
  )
}

export const Default = Template.bind({})

Default.args = {
  apiUrl: 'https://develop-prism-ml-api.ebus.swaws/prism-ml/',
  handleSceneBlobLoaderError: (err) => console.error(err),
  refDims: null,
  imageUrl: 'https://sherwin.scene7.com/is/image/sw?src=ir{swRender/hd_livingroom2?wid=1200}&qlt=92',
  // fyi maskUrl: 'https://sherwin.scene7.com/is/image/sw?src=ir{swRender/hd_livingroom2?wid=1200&req=object&opac=100&fmt=png8&object=wall&color=000000}&fmt=png8&bgColor=FFFFFF&op_invert=1'
  activeColor: color1,
  handleUpdates: (metadata) => console.log('Fastmask update', metadata),
  cleanupCallback: () => console.log('Cleaning up fastmask'),
  handleError: (err) => console.error(err),
  content: {
    userUploadAlt: 'The user uploaded this image',
    sceneView: {
      clearAreaText: 'Wipe Out'
    }
  },
  shouldPrimeImage: true
}

export default {
  title: 'FastMaskView',
  component: FastMaskView
}
