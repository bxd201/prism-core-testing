import React from 'react'
import ColorCollections from 'src/components/ColorCollections/ColorCollections'
import { within } from '@testing-library/react'
import { fireEvent } from '@testing-library/dom'

it('"Purely Refined", "2019 Aficionado" and "Buoyant" collection titles are immediately displayed', async () => {
  const { findByText } = render(<ColorCollections />)
  await findByText('Purely Refined')
  await findByText('2019 Aficionado')
  await findByText('Buoyant')
})

it('After clicking the "Pottery Barn" tab, the "Pottery Barn", "PBteen" and "Pottery Barn Kids" collection titles are displayed', async () => {
  const { findByText, findByRole } = render(<ColorCollections />)

  // click the tab in the tablist with text 'Pottery Barn'
  await within(await findByRole('tablist')).findByText('Pottery Barn').then(fireEvent.click)

  const mainArea = await findByRole('main')
  await within(mainArea).findByText('Pottery Barn')
  await within(mainArea).findByText('PBteen')
  await within(mainArea).findByText('Pottery Barn Kids')
})
