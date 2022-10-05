import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useRouteMatch } from 'react-router-dom'
import { compareKebabs } from 'src/shared/helpers/StringUtils'
import useGroupsAndSubgroups from 'src/shared/hooks/useGroupsAndSubgroups'
import { filterByFamily, filterBySection } from 'src/store/actions/loadColors'

function WallRouteReduxConnector ({ children }) {
  // this state allows the implementing component to control active color within Wall
  // Wall itself just calls onActivateColor when a color is chosen; it's up to the host to do
  // something with that data and provide Wall with an updated activeColorId
  const dispatch = useDispatch()
  const { group, subgroup } = useGroupsAndSubgroups()
  const { params } = useRouteMatch()

  useEffect(() => {
    const sectionDiff = !compareKebabs(group, params.section)
    const familyDiff = !compareKebabs(subgroup, params.family)

    if (sectionDiff) {
      dispatch(filterBySection(params.section))
    }

    if (params.section && familyDiff) {
      dispatch(filterByFamily(params.family))
    }
  },
  [params.section, group, params.family, subgroup])

  return children
}

export default WallRouteReduxConnector
