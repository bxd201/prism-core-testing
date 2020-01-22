// @flow
import 'src/allFacets' // import all facets so they're included in the bundle
import { flagAsMainBundle, embedAtRoots } from 'src/facetSupport/facetBinder'
import * as firebase from 'firebase'
import { FIREBASE_CONFIG } from './constants/configurations'

firebase.initializeApp(FIREBASE_CONFIG)
// identify this as the main bundle
flagAsMainBundle()
// perform embedding
embedAtRoots(true)
