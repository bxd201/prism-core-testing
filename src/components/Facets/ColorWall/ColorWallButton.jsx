// @flow
import React, { PureComponent } from 'react'

type Props = {
  family: string,
  checked: boolean,
  selectFamily: Function
}

class ColorWallButton extends PureComponent<Props> {
  constructor (props: Props) {
    super(props)

    this.handleChange = this.handleChange.bind(this)
  }

  render () {
    const { family, checked } = this.props

    return (
      <React.Fragment>
        <input
          type='radio'
          className='color-wall-button'
          name='selectedFamily'
          id={`family-${family}`}
          onChange={this.handleChange}
          value={family}
          checked={checked}
        />
        <label className='color-wall-label' htmlFor={`family-${family}`}>
          {family}
        </label>
      </React.Fragment>
    )
  }

  handleChange = function handleChange () {
    const { selectFamily, family } = this.props

    selectFamily(family)
  }
}

export default ColorWallButton
