// @flow
import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { loadScenes } from '../../store/actions/scenes'
import { SCENE_TYPES } from '../../constants/globals'
import cloneDeep from 'lodash/cloneDeep'

const ALL_SCENE_TYPES = ((items) => {
  const types = []
  for (let item in SCENE_TYPES) {
    types.push(SCENE_TYPES[item])
  }

  return types
})(SCENE_TYPES)

const setNumberOfSceneTypesLoaded = (sceneTypes: string[], scenes: any) => {
  let count = 0

  if (scenes) {
    if (scenes.sceneCollection) {
      Object.keys(scenes.sceneCollection).forEach(item => {
        if (sceneTypes.indexOf(item) > -1) {
          count++
        }
      })
    }
  }

  return count
}

export default function useSceneData (sceneTypes: string[]) {
  const _sceneTypes = sceneTypes.length === 1 && sceneTypes[0] === '*' ? ALL_SCENE_TYPES : sceneTypes
  const _scenes = useSelector(state => state.scenes)
  const dispatch = useDispatch()
  const [scenes, setScenes] = useState(null)

  useEffect(() => {
    _sceneTypes.forEach(sceneType => {
      dispatch(loadScenes(sceneType))
    })
  }, [])

  useEffect(() => {
    const count = setNumberOfSceneTypesLoaded(_sceneTypes, _scenes)
    if (count === _sceneTypes.length) {
      setScenes(cloneDeep(_scenes))
    }
  }, [_scenes])

  return scenes
}
