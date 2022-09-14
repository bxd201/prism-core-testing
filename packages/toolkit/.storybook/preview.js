import 'cypress-storybook/react'

import Prism from '../src/index'

export const decorators = [
  (Story) => (
    // prism inherits the font-family, manually set it here to imitate an importing environment setting it
    <Prism style={{ fontFamily: `'Open Sans', sans-serif` }}>
      <Story />
    </Prism>
  )
]

export const parameters = {
  backgrounds: {
    default: 'light'
  }
}
