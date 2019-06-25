/* eslint-disable */
/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import ButtonBar from 'src/components/GeneralButtons/ButtonBar/ButtonBar'

const getButtonBar = (children, props = {}) => {
  return shallow(<ButtonBar.Bar {...props}>{children}</ButtonBar.Bar>)
}

const getButton = (children, props = {}) => {
  return shallow(<ButtonBar.Button {...props}>{children}</ButtonBar.Button>)
}

describe('ButtonBar.Button', () => {
  let btn
  beforeEach(() => {
    if (!btn) {
      btn = getButton()
    }
  })

  it('should match snapshot', () => {
    expect(btn).toMatchSnapshot()
  })
})


describe('ButtonBar.Bar', () => {
  let bar
  beforeEach(() => {
    if (!bar) {
      bar = getButtonBar()
    }
  })

  it('should match snapshot', () => {
    expect(bar).toMatchSnapshot()
  })

  // it('should render input', () => {
  //   expect(bar.find('input').exists()).toBe(true)
  // })
})
