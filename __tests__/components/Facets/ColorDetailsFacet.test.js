import React from 'react'
import { ColorDetailsPage } from 'src/components/Facets/ColorDetailsFacet'
import { fireEvent, within } from '@testing-library/dom'
import memoizee from 'memoizee'

test('<ColorDetailsFacet colorSEO=\'sw-6475-country-squire\' subscribe={...} />', async () => {
  const { findByText, findByLabelText, findByRole } = render(
    <ColorDetailsPage colorSEO='sw-6475-country-squire' subscribe={memoizee((key, callbackfn) => { callbackfn('/') })} />
  )
  // shows "SW 6475" and it's coordinating colors by default
  await findByText('SW 6475')
  await findByText('SW 9165')
  await findByText('SW 6471')
  await findByText('SW 6462')

  // after clicking the "similar colors" tab color links for "sw-2934-clover" and "sw-2932-perennial-green" are present with correct background-color
  await fireEvent.click(await findByText('Similar Colors'))
  expect(await findByLabelText('SW 2934 Clover')).toHaveStyle('background-color: rgb(5, 66, 57)')
  expect(await findByLabelText('SW 2932 Perennial Green')).toHaveStyle('background-color: rgb(27, 82, 54)')

  // after clicking the details tab, the "View all Blue paint colors →" link and the "#124a42" hex value is displayed
  await fireEvent.click(await findByText('Details'))
  expect(await findByText('View all Blue paint colors →')).toHaveAttribute('href', '/blue')
  await findByText('#124a42')

  // the radiogroup section has images for all 5 scenes
  const radiogroup = await findByRole('radiogroup')
  await within(radiogroup).findByAltText('Living Room Day')
  await within(radiogroup).findByAltText('Kitchen Day')
  await within(radiogroup).findByAltText('Bathroom Day')
  await within(radiogroup).findByAltText('Exterior House Day')

  // "Living Room Day" scene image is displayed in the main secton by default
  const main = await findByRole('main')
  await within(main).findByAltText('Living Room Day')

  // "Kitchen Day" scene image is displayed in the main section after clicking it's thumbnail
  await fireEvent.click(await within(radiogroup).findByAltText('Kitchen Day'))
  await within(main).findByAltText('Kitchen Day')

  // "Kitchen Night" scene image is displayed in the main section after clicking the variant toggle
  await fireEvent.click(await findByLabelText('Switch to night view'))
  await within(main).findByAltText('Kitchen Night')
}, 30000)
