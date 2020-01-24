// @flow
import memoizee from 'memoizee'
import * as firebase from 'firebase'
import { type FirebaseConfig } from 'constants/configurations'

export const initFirebaseOnce = memoizee((config: FirebaseConfig) => {
  firebase.initializeApp(config)
}, { length: 1 })
