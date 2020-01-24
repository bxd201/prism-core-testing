// @flow

import ReactGA from 'react-ga'
import noop from 'lodash/noop'
import once from 'lodash/once'
import memoizee from 'memoizee'
import { GOOGLE_ANALYTICS_UID } from 'src/constants/globals'

// ------------------- CONSTANTS -----------------
// PRISM-specific tracker ID
const GA_TRACKER_NAME = 'GAtrackerPRISM'

// ------------------- INITIALIZATION --------------
const init = once(() => {
  ReactGA.initialize([{
    trackingId: GOOGLE_ANALYTICS_UID,
    gaOptions: {
      name: GA_TRACKER_NAME
    }
  }], { alwaysSendToDefaultTracker: false })
})

// ------------------- UTILITIES -----------------
const canTrack = memoizee((func: Function): Function => {
  if (ENV !== 'production') {
    return noop
  }

  return function (data: any) {
    init()
    func(data)
  }
}, { length: 1 })

// ------------------- TYPES -----------------

type GAEvent = {
  action: string,
  category: string,
  label: string
}

type GASet = {
  [key: string]: string
}

type GAPageView = string

// ------------------- EXPORTS -----------------

export const event = canTrack((data: GAEvent) => {
  ReactGA.event(data, [GA_TRACKER_NAME])
})

export const set = canTrack((data: GASet) => {
  ReactGA.set(data, [GA_TRACKER_NAME])
})

export const pageView = canTrack((data: GAPageView) => {
  ReactGA.pageview(data, [GA_TRACKER_NAME])
})
