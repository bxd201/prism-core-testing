import React from 'react'
import { shallow, mount } from 'enzyme'
import { DndProvider } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'

// Create IntlProvider to retrieve React Intl context
const wrappingComponentProps = {
  backend: HTML5Backend
}

export function mountWithDnd(node: React.ReactElement, options = {}) {
  const _options = options ? options : {}

  return mount(node, {
    wrappingComponent: DndProvider,
    wrappingComponentProps,
    ..._options
  })
}

export function shallowWithDnd(node: React.ReactElement, options = {}) {
  const _options = options ? options : {}

  return shallow(node, {
    wrappingComponent: DndProvider,
    wrappingComponentProps,
    ..._options
  })
}

export default shallowWithDnd
