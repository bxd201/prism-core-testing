import React from 'react'
import { shallow } from 'enzyme'
import Messages from 'src/components/Messages/GenericMessage'

const createMessage = (props = {}) => {
  return shallow(<Messages {...props} />)
}

const dummyComponent = () => {
  return <div>TEST</div>
}

// rendering and snapshot test
describe('Coordinary Color Swatch component will pass props correctly', () => {
  it('snapshot testing', () => {
    const wrapper = createMessage()
    expect(wrapper).toMatchSnapshot()
  })

  it('child component will be rendering', () => {
    const wrapper = createMessage({ children: dummyComponent })
    const childWrapper = shallow(wrapper.props().children.props.children())
    expect(childWrapper.find('div').text()).toEqual('TEST')
  })
})
