// @flow
import React, { useEffect } from 'react'
import ColorsFromImage from './ColorsFromImage'
import { useSelector, useDispatch } from 'react-redux'
import { loadBrandColors } from '../../store/actions/brandColors'

type InspiredProps = { data: Object, isActivedPage: boolean }

export default ({ isActivedPage, data }: InspiredProps) => {
  const dispatch = useDispatch()
  useEffect(() => { dispatch(loadBrandColors()) }, [])
  const brandColors = useSelector(state => state.brandColors.data)

  return (
    <div className='scene__image__wrapper'>
      <ColorsFromImage isActivedPage={isActivedPage} data={data} brandColors={brandColors} />
    </div>
  )
}
