import React from 'react'
import ExpertColorPicks from 'src/components/ExpertColorPicks/ExpertColorPicks'
import { fireEvent } from '@testing-library/dom'

it('title and expertColorPick buttons exist', async () => {
  const { findByText } = render(<ExpertColorPicks />)
  await findByText('Expert Color Picks')
  await findByText('Orchid')
  await findByText('Organic Green')
  await findByText('Homburg Gray')
})

it('clicking an expert color pick displays it\'s details', async () => {
  const { findByText } = render(<ExpertColorPicks />)

  await findByText('Orchid').then(fireEvent.click)
  // fireEvent.click(findByText('Orchid'))

  await findByText('Poised Taupe')
  await findByText('Porcelain')
})
