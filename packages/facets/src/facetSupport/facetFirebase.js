// @flow
import { type FirebaseConfig } from 'constants/configurations'
import * as firebase from 'firebase/app'
import memoizee from 'memoizee'

export const initFirebaseOnce = memoizee((config: FirebaseConfig) => {
  firebase.initializeApp(config)
}, { length: 1 })
