// @flow
import { useContext,useEffect } from 'react'
import { useDispatch,useSelector } from 'react-redux'
import ConfigurationContext from 'src/contexts/ConfigurationContext/ConfigurationContext'
import { type ColorsStateItems,type ColorsStateStatus } from 'src/shared/types/Actions.js.flow'
import { loadColors } from 'src/store/actions/loadColors'

type Response = [
  ColorsStateItems, ColorsStateStatus
]

function useColors (): Response {
  const { items, group, status, shape } = useSelector(state => state.colors)
  const { brandId } = useContext(ConfigurationContext)
  const dispatch = useDispatch()

  useEffect(() => {
    if (brandId) {
      dispatch(loadColors(brandId))
    }
  }, [brandId])

  // @todo we should refactor this api to be more comprehensive -RS
  return [items, group, status, shape]
}

export default useColors
