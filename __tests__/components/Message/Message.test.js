import React from 'react'
import { shallow } from 'enzyme'
import GenericMessage from 'src/components/Messages/GenericMessage'

const createMessage = (props = {}, content = void (0)) => {
  return shallow(<GenericMessage {...props}>{content}</GenericMessage>)
}

const dummyComponent = () => {
  return <div>TEST</div>
}

// rendering and snapshot test
describe('Coordinary Color Swatch component will pass props correctly', () => {
  it('snapshot testing', () => {
    const wrapper = createMessage({}, dummyComponent())
    expect(wrapper).toMatchSnapshot()
  })

  it('child component will be rendering', () => {
    const inner = dummyComponent()
    const wrapper = createMessage({}, inner)
    expect(wrapper.html().indexOf(shallow(inner).html())).toBeGreaterThan(-1)
  })
})
