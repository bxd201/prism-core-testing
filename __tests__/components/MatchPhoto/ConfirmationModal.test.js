/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { Link } from 'react-router-dom'
import ConfirmationModal, { contentClass, buttonClass } from 'src/components/MatchPhoto/ConfirmationModal'

const getConfirmationModal = props => {
  let defaultProps = {
    onClickNo: jest.fn(),
    isActive: true
  }

  let newProps = Object.assign({}, defaultProps, props)
  return shallow(<ConfirmationModal {...newProps} />)
}

describe('ConfirmationModal with props', () => {
  let confirmationModal
  beforeEach(() => {
    if (!confirmationModal) {
      confirmationModal = getConfirmationModal()
    }
  })

  it('should match snapshot with props', () => {
    expect(confirmationModal).toMatchSnapshot()
  })

  it(`should render p.${contentClass} with headerContent`, () => {
    const headerContent = 'The photo content will be lost if you close. Make sure the colors you want to keep have been added to your palette. Do you still want to close?'
    expect(confirmationModal.find(`p.${contentClass}`).contains(headerContent)).toBe(true)
  })

  it('should render Link component', () => {
    expect(confirmationModal.find(Link).exists()).toBe(true)
  })

  it('should render Link component with prop to as /active', () => {
    expect(confirmationModal.find(Link).props().to).toEqual('/active')
  })

  it('should render two buttons', () => {
    expect(confirmationModal.find(`button.${buttonClass}`)).toHaveLength(2)
  })

  it('should render two buttons with content YES and NO', () => {
    const buttonContents = []
    confirmationModal.find(`button.${buttonClass}`).map(el => {
      buttonContents.push(el.props().children)
    })

    const buttonContentsDefault = ['YES', 'NO']
    expect(buttonContents).toEqual(buttonContentsDefault)
  })
})
