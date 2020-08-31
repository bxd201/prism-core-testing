import React from 'react'
import ExpertColorPicks from 'src/components/ExpertColorPicks/ExpertColorPicks'
import { fireEvent } from '@testing-library/dom'

it('ExpertColorPicks', async () => {
  const { findByText } = render(<ExpertColorPicks />)

  // title and expertColorPick buttons exist
  await findByText('Expert Color Picks')
  await findByText('Orchid')
  await findByText('Organic Green')
  await findByText('Homburg Gray')

  // clicking an expert color pick displays it's details
  await fireEvent.click(await findByText('Orchid'))
  await findByText('Poised Taupe')
  await findByText('Porcelain')
})
