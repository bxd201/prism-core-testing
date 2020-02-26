import React from 'react'
import InspiredSceneNavigator from 'src/components/InspirationPhotos/InspiredSceneNavigator'
import { within } from '@testing-library/react'
import { fireEvent } from '@testing-library/dom'

it('default pin\'s text is "Cloudless"', async () => {
  const { findByRole } = render(<InspiredSceneNavigator />)
  await within(await findByRole('main')).findByText('Cloudless')
})

it('after clicking the globetrotting tab, the default pin\'s text is "Gecko"', async () => {
  const { findByRole } = render(<InspiredSceneNavigator />)
  await within(await findByRole('tablist')).findByText('Globetrotting').then(fireEvent.click)
  await within(await findByRole('main')).findByText('Gecko')
})

it('after clicking the next button (right arrow), the default pin\'s text is "Cyclamen"', async () => {
  const { findByRole } = render(<InspiredSceneNavigator />)
  await within(await findByRole('main')).findByLabelText('next').then(fireEvent.click)
  await within(await findByRole('main')).findByText('Cyclamen')
})

it('after clicking the previous button (left arrow), the default pin\'s text is "Danube" and "Time Capsule" is the selected tab', async () => {
  const { findByRole } = render(<InspiredSceneNavigator />)
  await within(await findByRole('main')).findByLabelText('previous').then(fireEvent.click)
  await within(await findByRole('main')).findByText('Danube')
  expect(await within(await findByRole('tablist')).findByText('Time Capsule')).toHaveAttribute('aria-selected', 'true')
})
