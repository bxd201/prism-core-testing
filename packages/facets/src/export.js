import mapValues from 'lodash/mapValues'
import { allFacets } from 'src/allFacets'
import { facetMasterWrapper } from 'src/facetSupport/facetMasterWrapper'

const wrappedFacets = mapValues(allFacets, facet => facetMasterWrapper(facet))

export default wrappedFacets
