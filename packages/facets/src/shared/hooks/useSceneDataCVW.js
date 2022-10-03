// @flow
import { useDispatch } from 'react-redux'
import { SCENES_ENDPOINT } from '../../constants/endpoints'
import {
  fetchRemoteScenes,
  handleScenesFetchedForCVW,
  handleScenesFetchErrorForCVW
} from '../../store/actions/loadScenes'
import { setInitializingFacetId } from '../../store/actions/system'

// Returns flag that tells if fetch has been initialized
function useSceneDataCVW (initializingFacetId: string | null, facetId: string, scenesFetchCalled: boolean, brandId: string | null, language: string | null) {
  const dispatch = useDispatch()
  if (!initializingFacetId) {
    dispatch(setInitializingFacetId(facetId))
  }

  if (brandId && language && initializingFacetId && facetId && initializingFacetId === facetId && !scenesFetchCalled) {
    // @todo scene type should probably be a facet prop -RS
    fetchRemoteScenes(brandId, { language }, SCENES_ENDPOINT, handleScenesFetchedForCVW, handleScenesFetchErrorForCVW, dispatch)
    return true
  }

  return false
}

export default useSceneDataCVW
