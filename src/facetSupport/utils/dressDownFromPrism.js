import { ALL_WRAPPING_CLASSES } from '../facetConstants'

export default function dressDownFromPrism (prismRoot) {
  prismRoot.className = ALL_WRAPPING_CLASSES.reduce((accum, next) => accum.replace(new RegExp(next, 'g'), ''), prismRoot.className)
  return prismRoot
}
