// @flow
import once from 'lodash/once'
import ReactGA from 'react-ga'
import { GOOGLE_ANALYTICS_UID } from 'src/constants/globals'

// initializes tracking -- only runs once
export const initTrackingOnce = once(() => {
  // don't initialize tracking on prod
  if (process.env.NODE_ENV === 'production') {
    return
  }

  ReactGA.initialize([{
    trackingId: GOOGLE_ANALYTICS_UID,
    gaOptions: {
      name: 'GAtrackerPRISM'
    }
  }], { alwaysSendToDefaultTracker: false })
})
