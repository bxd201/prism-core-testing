import React from 'react'
import ZoomTool from 'src/components/PaintScene/ZoomTool'

test('ZoomTool', async () => {
  const applyZoom = jest.fn()
  const { getByText, getByLabelText } = render(
    <ZoomTool
      applyZoom={applyZoom}
    />
  )

  getByText('ZOOM OUT')
  getByText('ZOOM IN')
  getByLabelText('zoom slider')
})
