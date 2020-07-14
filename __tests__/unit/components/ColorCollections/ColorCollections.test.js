import React from 'react'
import ColorCollections from 'src/components/ColorCollections/ColorCollections'
import { within } from '@testing-library/react'
import { fireEvent } from '@testing-library/dom'

test('ColorCollections', async () => {
  const { findByText, findByRole } = render(<ColorCollections />)

  // "Purely Refined", "2019 Aficionado" and "Buoyant" collection titles are immediately displayed
  await findByText('Purely Refined')
  await findByText('2019 Aficionado')
  await findByText('Buoyant')

  // After clicking the "Pottery Barn" tab, the "Pottery Barn", "PBteen" and "Pottery Barn Kids" collection titles are displayed
  await fireEvent.click(await within(await findByRole('tablist')).findByText('Pottery Barn'))
  await within(await findByRole('main')).findByText('Pottery Barn')
  await findByText('PBteen')
  await findByText('Pottery Barn Kids')
})
