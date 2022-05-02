// @flow
import { useMemo } from 'react'
import { useSelector } from 'react-redux'

type Response = {
  groups: string[] | void,
  group: string | void,
  subgroups: string[] | void,
  subgroup: string | void
}

const DEFAULT: Response = {
  groups: [],
  group: undefined,
  subgroups: [],
  subgroup: undefined
}

function useGroupsAndSubgroups (hiddenGroups: string[] | void): Response {
  const colors = useSelector(state => state.colors)
  const {
    cwv3,
    families,
    family,
    groups,
    section,
    sections,
    status,
    subgroups
  } = colors

  const returnVal = useMemo(() => {
    if (status.requestComplete && !status.error) {
      if (cwv3) {
        const workingGroups = hiddenGroups && hiddenGroups.length ? groups.filter(({ name }) => hiddenGroups.indexOf(name) === -1) : groups
        const currentGroup = workingGroups.find(sect => sect.name === section)
        const filteredSubgroups = currentGroup ? currentGroup.subgroups.map(id => subgroups.find(sg => sg.id === id)?.name).filter(Boolean) : DEFAULT.subgroups

        return {
          group: section,
          groups: workingGroups.map(({ name }) => name),
          subgroup: family,
          subgroups: filteredSubgroups
        }
      } else {
        const workingGroups = hiddenGroups && hiddenGroups.length ? sections.filter(name => hiddenGroups.indexOf(name) === -1) : sections

        return {
          group: section,
          groups: workingGroups,
          subgroup: family,
          subgroups: families
        }
      }
    }

    return DEFAULT
  }, [
    hiddenGroups,
    cwv3,
    families,
    family,
    groups,
    section,
    sections,
    status,
    subgroups
  ])

  return returnVal
}

export default useGroupsAndSubgroups
