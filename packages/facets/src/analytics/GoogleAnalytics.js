// @flow

import ReactGA from 'react-ga'
import noop from 'lodash/noop'
import once from 'lodash/once'
import memoizee from 'memoizee'
import {
  GA_TRACKER_NAME_CBG_HGSW,
  GA_TRACKER_NAME_CBG_VALSPAR,
  GA_TRACKER_NAME_SW,
  GOOGLE_ANALYTICS_UID_CBG_HGSW,
  GOOGLE_ANALYTICS_UID_CBG_VALSPAR,
  GOOGLE_ANALYTICS_UID_SW} from 'src/constants/globals'

// ------------------- INITIALIZATION --------------

const init = once(() => {
  ReactGA.initialize(
    [
      {
        trackingId: GOOGLE_ANALYTICS_UID_SW,
        gaOptions: { name: GA_TRACKER_NAME_SW }
      },
      {
        trackingId: GOOGLE_ANALYTICS_UID_CBG_HGSW,
        gaOptions: { name: GA_TRACKER_NAME_CBG_HGSW }
      },
      {
        trackingId: GOOGLE_ANALYTICS_UID_CBG_VALSPAR,
        gaOptions: { name: GA_TRACKER_NAME_CBG_VALSPAR }
      }
    ],
    { alwaysSendToDefaultTracker: false }
  )
})

// ------------------- UTILITIES -----------------

const canTrack = memoizee(
  (func: Function): Function => {
    if (ENV !== 'production') {
      return noop
    }

    return function (data: any, tracker: string) {
      init()
      func(data, tracker)
    }
  },
  { length: 1 }
)

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

export const event = canTrack((data: GAEvent, tracker: string) => {
  ReactGA.event(data, [tracker])
})

export const set = canTrack((data: GASet, tracker: string) => {
  ReactGA.set(data, [tracker])
})

export const pageView = canTrack((data: GAPageView, tracker: string) => {
  ReactGA.pageview(data, [tracker])
})

export const exception = (description: string, fatal: boolean = false) => {
  if (ENV !== 'production') {
    return console.error(description)
  }

  ReactGA.exception({
    description,
    fatal
  })
}

const RealColorExceptions = {
  S0: 'RealColor Error under: 3s',
  S3: 'RealColor Error within: 3s',
  S5: 'RealColor Error within: 5s',
  S10: 'RealColor Error within: 10s',
  S15: 'RealColor Error within: 15s',
  S20: 'RealColor Error within: 20s',
  S30: 'RealColor Error within: 30s',
  S60: 'RealColor Error within: 60s',
  S90: 'RealColor Error after: 90s'
}

export const getRealColorException = (duration: number): string => {
  if (duration >= 90) {
    return RealColorExceptions.S90
  }
  if (duration >= 60) {
    return RealColorExceptions.S60
  }
  if (duration >= 30) {
    return RealColorExceptions.S30
  }
  if (duration >= 15) {
    return RealColorExceptions.S15
  }
  if (duration >= 10) {
    return RealColorExceptions.S10
  }
  if (duration >= 5) {
    return RealColorExceptions.S5
  }
  if (duration >= 3) {
    return RealColorExceptions.S3
  }

  return RealColorExceptions.S0
}
