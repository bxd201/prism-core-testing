// @flow
import toArray from 'lodash/toArray'
import { TO_BIND_CLASS } from '../facetConstants'

// gathers either A) all embed roots, or B) embed roots matching a specified facet name
export default function gatherReactRoots (root: Document = document): any[] {
  const nodes: NodeList<any> = (root && root.querySelectorAll && root.querySelectorAll(`.${TO_BIND_CLASS}`))
  if (!nodes) {
    return []
  }

  return toArray(nodes)
}
