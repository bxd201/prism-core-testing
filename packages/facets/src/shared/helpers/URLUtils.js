// @flow
import { ROUTE_PARAMS, ROUTE_PARAM_NAMES } from 'constants/globals'
import { trimTrailingSlashes } from './StringUtils'

/**
 * @example urlWorker.get(ROUTE_PARAMS.SEARCH).from('/my/url/search/searchTerm') -> 'searchTerm'
 * @example urlWorker.set(ROUTE_PARAMS.SEARCH, 'firstValue').in('/my/url/') -> '/my/url/search/firstValue/'
 * @example urlWorker.set(ROUTE_PARAMS.SEARCH, ['firstValue', 'secondValue']).in('/my/url/') -> '/my/url/search/firstValue/secondValue/'
 * @example urlWorker.remove(ROUTE_PARAMS.SEARCH).from('/my/url/search/firstValue') -> '/my/url/'
 * @example urlWorker.remove(ROUTE_PARAMS.SEARCH, 3).from('/my/url/search/firstValue/secondValue/thirdValue') -> '/my/url/'
 */
function URLWorker () {
  const _getFrom = (routeParam: string) => (url: string): Object => {
    switch (routeParam) {
      case ROUTE_PARAMS.SECTION: {
        const res = new RegExp(`(/${ROUTE_PARAMS.SECTION})/([^/]*)`).exec(url)
        return res
          ? {
              [ROUTE_PARAM_NAMES.SECTION]: res[2]
            }
          : {}
      }
      case ROUTE_PARAMS.FAMILY: {
        const res = new RegExp(`(/${ROUTE_PARAMS.FAMILY})/([^/]*)`).exec(url)
        return res
          ? {
              [ROUTE_PARAM_NAMES.FAMILY]: res[2]
            }
          : {}
      }
      case ROUTE_PARAMS.COLOR: {
        const res = new RegExp(`(/${ROUTE_PARAMS.COLOR})/([^/]*)/([^/]*)`).exec(url)
        return res
          ? {
              [ROUTE_PARAM_NAMES.COLOR_ID]: res[2],
              [ROUTE_PARAM_NAMES.COLOR_SEO]: res[3]
            }
          : {}
      }
      case ROUTE_PARAMS.SEARCH: {
        const res = new RegExp(`(/${ROUTE_PARAMS.SEARCH})/([^/]*)`).exec(url)
        return res
          ? {
              [ROUTE_PARAM_NAMES.SEARCH]: res[2]
            }
          : {}
      }
    }

    return {}
  }

  const _setUsing = (routeParam: string, values: string | string[]) => (url: string) => {
    const _url = trimTrailingSlashes(url)
    const _values = typeof values === 'string' ? [values] : values
    const regexString = `(/${routeParam}/)` + _values.map(() => '([^/]*)').join('/')
    const replacementString = '$1' + _values.join('/')
    const regex = new RegExp(regexString)

    // if we can find a match for our replacement regex in the URL
    if (_url.match(regex)) {
      return _url.replace(regex, replacementString)
    }

    return _url.split('/').concat(routeParam, _values).join('/')
  }

  const _removeFrom = (routeParam: string, valueCount: number) => (url: string) => {
    const _url = trimTrailingSlashes(url)
    const regexString = `/${routeParam}/` + Array.from(new Array(valueCount)).map(() => '([^/]*)').join('/')
    const regex = new RegExp(regexString)

    if (_url.match(regex)) {
      return _url.replace(regex, '')
    }

    return _url
  }

  const _get = (routeParam: string) => ({ from: _getFrom(routeParam) })
  const _set = (routeParam: string, values: string | string[]) => ({ in: _setUsing(routeParam, values) })
  const _remove = (routeParam: string, valueCount: number = 1) => ({ from: _removeFrom(routeParam, valueCount) })

  this.get = _get
  this.set = _set
  this.remove = _remove
}

export const urlWorker = new URLWorker()
