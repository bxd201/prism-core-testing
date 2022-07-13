// @flow
import { useEffect, useContext } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import ConfigurationContext from 'src/contexts/ConfigurationContext/ConfigurationContext'
import { loadColors } from 'src/store/actions/loadColors'
import { type ColorsStateStatus, type ColorsStateItems } from 'src/shared/types/Actions.js.flow'

type Response = [
  ColorsStateItems, ColorsStateStatus
]

function useColors (): Response {
  const { items, status, shape } = useSelector(state => state.colors)
  const { brandId } = useContext(ConfigurationContext)
  const dispatch = useDispatch()

  useEffect(() => {
    if (brandId) {
      dispatch(loadColors(brandId))
    }
  }, [brandId])

  // @todo we should refactor this api to be more comprehensive -RS
  return [ items, status, shape ]
}

export default useColors
