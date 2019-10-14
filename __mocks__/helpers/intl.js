/**
 * Components using the react-intl module require access to the intl context.
 * This is not available when mounting single components in Enzyme.
 * These helper functions aim to address that and wrap a valid,
 * English-locale intl context around them.
 */

import React from 'react'
import { intlShape, IntlProvider } from 'react-intl'
import { shallow, mount } from 'enzyme'

import '@formatjs/intl-relativetimeformat/polyfill'
import '@formatjs/intl-relativetimeformat/polyfill-locales'

const messages = require('src/translations/en-US.json') // en.json
const defaultLocale = 'en'

// Create IntlProvider to retrieve React Intl context
const wrappingComponentProps = {
  defaultLocale,
  locale: defaultLocale,
  messages
}

export function mountWithIntl(node: React.ReactElement, options = {}) {
  const _options = options ? options : {}

  return mount(node, {
    wrappingComponent: IntlProvider,
    wrappingComponentProps,
    ..._options
  })
}

export function shallowWithIntl(node: React.ReactElement, options = {}) {
  const _options = options ? options : {}

  return shallow(node, {
    wrappingComponent: IntlProvider,
    wrappingComponentProps,
    ..._options
  })
}

export default shallowWithIntl
