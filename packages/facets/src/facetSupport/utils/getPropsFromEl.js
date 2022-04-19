// @flow
import mapValues from 'lodash/mapValues'

export default (el: HTMLElement) => {
  const { reactComponent, prismFacet, ...otherProps } = mapValues(Object.assign({}, el.dataset), v => v === '' ? true : v)
  return {
    ...otherProps,
    prismFacet: prismFacet || reactComponent
  }
}
