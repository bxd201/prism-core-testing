describe('sw-color-visualizer-wrapper', () => {
  // POC - test only purpose for canvas element
  context('Paint this Scene', () => {
    before(() => {
      localStorage.setItem('landingPageShownSession', 1)
      localStorage.setItem('lp', '{"colors":[{"colorNumber":"6840","coordinatingColors":{"coord1ColorId":"11364","coord2ColorId":"11335","whiteColorId":"2681"},"description":["Fairly Colorful","Moderately Colorful","Fairly Bright"],"id":"bright-2527","isExterior":true,"isInterior":true,"name":"Exuberant Pink","lrv":16.597,"brandedCollectionNames":["High Voltage","Restless Nomad","2018 Unity"],"colorFamilyNames":["Red"],"brandKey":"SW","red":181,"green":77,"blue":127,"hue":0.9198717948717948,"saturation":0.41269841269841273,"lightness":0.5058823529411764,"hex":"#b54d7f","isDark":true,"storeStripLocator":"101-C1","similarColors":["2259","2530","2665","2266","2252","2528","2542","2547","1978","2538"],"ignore":true,"archived":false,"lab":{"L":47.835418590154376,"A":47.49565254108684,"B":-7.211106812729673}}],"activeColor":{"colorNumber":"6840","coordinatingColors":{"coord1ColorId":"11364","coord2ColorId":"11335","whiteColorId":"2681"},"description":["Fairly Colorful","Moderately Colorful","Fairly Bright"],"id":"bright-2527","isExterior":true,"isInterior":true,"name":"Exuberant Pink","lrv":16.597,"brandedCollectionNames":["High Voltage","Restless Nomad","2018 Unity"],"colorFamilyNames":["Red"],"brandKey":"SW","red":181,"green":77,"blue":127,"hue":0.9198717948717948,"saturation":0.41269841269841273,"lightness":0.5058823529411764,"hex":"#b54d7f","isDark":true,"storeStripLocator":"101-C1","similarColors":["2259","2530","2665","2266","2252","2528","2542","2547","1978","2538"],"ignore":true,"archived":false,"lab":{"L":47.835418590154376,"A":47.49565254108684,"B":-7.211106812729673}},"toggleCompareColor":false,"temporaryActiveColor":null,"previousActiveColor":{"colorNumber":"6840","coordinatingColors":{"coord1ColorId":"11364","coord2ColorId":"11335","whiteColorId":"2681"},"description":["Fairly Colorful","Moderately Colorful","Fairly Bright"],"id":"bright-2527","isExterior":true,"isInterior":true,"name":"Exuberant Pink","lrv":16.597,"brandedCollectionNames":["High Voltage","Restless Nomad","2018 Unity"],"colorFamilyNames":["Red"],"brandKey":"SW","red":181,"green":77,"blue":127,"hue":0.9198717948717948,"saturation":0.41269841269841273,"lightness":0.5058823529411764,"hex":"#b54d7f","isDark":true,"storeStripLocator":"101-C1","similarColors":["2259","2530","2665","2266","2252","2528","2542","2547","1978","2538"],"ignore":true,"archived":false,"lab":{"L":47.835418590154376,"A":47.49565254108684,"B":-7.211106812729673}}}')
      cy.visit('/sw-com/sw-color-visualizer-wrapper.html#/cvw/active')
    })

    it('paints an area of scene', () => {
      cy.findAllByTestId('MOUSE_LISTENER').first().click()
      cy.get('.tintable-view__wrapper > :nth-child(4)').snapshot({ name: 'scene' })
    })
  })
})
