import { facetMasterWrapper } from 'src/facetSupport/facetMasterWrapper'
import mapValues from 'lodash/mapValues'
import { allFacets } from 'src/allFacets'

const wrappedFacets = mapValues(allFacets, facet => facetMasterWrapper(facet))

export default wrappedFacets
