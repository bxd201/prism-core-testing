/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { MatchPhoto } from 'src/components/MatchPhoto/MatchPhoto'
import FileInput from 'src/components/FileInput/FileInput'

const historyMock = { goBack: jest.fn() }
const getMatchPhoto = props => {
  let defaultProps = {
    history: historyMock
  }

  let newProps = Object.assign({}, defaultProps, props)
  return shallow(<MatchPhoto {...newProps} />)
}

describe('MatchPhoto with props', () => {
  let matchPhoto
  beforeEach(() => {
    if (!matchPhoto) {
      matchPhoto = getMatchPhoto()
    }
  })

  it('should render FileInput', () => {
    expect(matchPhoto.find(FileInput).exists()).toBe(true)
  })
})

describe('MatchPhoto events', () => {
  let matchPhoto
  const setState = jest.fn()
  const useStateSpy = jest.spyOn(React, 'useState')
  useStateSpy.mockImplementation((init) => [init, setState])

  beforeEach(() => {
    if (!matchPhoto) {
      matchPhoto = getMatchPhoto()
    }
  })

  // TODO:noah.hall
  // failure: TypeError: Cannot assign to read only property
  // 'createObjectURL' of function 'function URL(url) {
  // it('should call mocked useState on input click', () => {
  //   let blob = new Blob(['(image-data)'], { type: 'image/png' })
  //   blob['lastModifiedDate'] = new Date()
  //   blob['name'] = 'image.png'
  //   const mockedEvent = { target: { files: [blob] } }
  //   URL.createObjectURL = jest.fn()
  //   matchPhoto.find(FileInput).simulate('change', mockedEvent)
  //   expect(setState).toHaveBeenCalledWith(URL.createObjectURL(blob))
  // })
})
