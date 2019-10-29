/* eslint-env jest */
// @flow
import React from 'react'
import { mount } from 'enzyme'
import { EnvAdapter, type Props, EVENT_NAME_PREFIX, getStoreValues } from '../../../src/components/EnvAdapter/EnvAdapter'

const getComponent = (props: Props) => {
  const defaultProps = {}
  const newProps = {
    ...defaultProps,
    ...props
  }

  return mount(<EnvAdapter {...newProps} />)
}

describe('EnvAdapter', () => {
  let basicEnvAdapter

  beforeAll(() => {
    if (!basicEnvAdapter) {
      basicEnvAdapter = getComponent()
    }
  })

  it('should match snapshot', () => {
    expect(basicEnvAdapter).toMatchSnapshot()
  })

  it('should emit something when its watched properties are changed', (done) => {
    const comp = getComponent()
    const node = comp.getDOMNode()
    // get all watched properties of EnvAdapter
    const properties = Object.keys(getStoreValues())
    // generate random values paired to each property
    const values = properties.map((val, i) => `${val} test value`)

    // loop over all watched properties...
    properties.forEach((prop: string, i: number) => {
      const testValue = values[i]
      const testEvent = `${EVENT_NAME_PREFIX}.${prop}`

      // ... add an event listener for each property
      node.addEventListener(testEvent, (event) => {
        expect(event.detail).toEqual(testValue)
        done()
      })

      // and set each property in sequence to our test value
      comp.setProps({
        store: {
          [prop]: testValue
        }
      })
    })
  })
})
