/**
 * Components using the react-intl module require access to the intl context.
 * This is not available when mounting single components in Enzyme.
 * These helper functions aim to address that and wrap a valid,
 * English-locale intl context around them.
 */

import React from 'react'
import { IntlProvider, intlShape } from 'react-intl'
import { shallow, mount } from 'enzyme'

const messages = require('src/translations/en-US.json') // en.json
const intl = new IntlProvider({ locale: 'en', messages }, {})
// const { intl } = intlProvider.getChildContext()

/**
 * When using React-Intl `injectIntl` on components, props.intl is required.
 */
const nodeWithIntlProp = node => {
  return React.cloneElement(<IntlProvider locale='en' messages={messages}>{node}</IntlProvider>, { intl })
}

export const shallowWithIntl = node => {
  return shallow(nodeWithIntlProp(node), { context: { intl } })
}

export default shallowWithIntl

export const mountWithIntl = node => {
  return mount(nodeWithIntlProp(node), {
    context: { intl },
    childContextTypes: { intl: intlShape }
  })
}
