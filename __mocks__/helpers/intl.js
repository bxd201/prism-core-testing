/**
 * Components using the react-intl module require access to the intl context.
 * This is not available when mounting single components in Enzyme.
 * These helper functions aim to address that and wrap a valid,
 * English-locale intl context around them.
 */

import React from 'react'
import { IntlProvider } from 'react-intl'
import { shallow, mount } from 'enzyme'

const messages = require('src/translations/en-US.json') // en.json
const defaultLocale = 'en'

const wrappingComponentProps = {
  defaultLocale,
  locale: defaultLocale,
  messages
}

const mountOptions = {
  wrappingComponent: IntlProvider,
  wrappingComponentProps
}

export function mountWithIntl(node: React.ReactElement, options = {}) {
  const _options = options ? options : {}

  return mount(node, {
    ...mountOptions,
    ..._options
  })
}

export function shallowWithIntl(node: React.ReactElement, options = {}) {
  const _options = options ? options : {}

  return shallow(node, {
    ...mountOptions,
    ..._options
  })
}

export default shallowWithIntl
