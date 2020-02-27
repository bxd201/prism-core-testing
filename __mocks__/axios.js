import {
  EXPERT_COLOR_PICKS_ENDPOINT,
  COLOR_CHUNKS_ENDPOINT,
  COLOR_BRIGHTS_ENDPOINT,
  COLOR_FAMILY_NAMES_ENDPOINT,
  COLORS_ENDPOINT,
  COLLECTION_SUMMARIES_ENDPOINT
} from 'src/constants/endpoints'

import { generateBrandedEndpoint } from 'src/shared/helpers/DataUtils'

const axios = jest.genMockFromModule('axios')

axios.get = (url) => {
  switch (url) {
    case EXPERT_COLOR_PICKS_ENDPOINT:
      return Promise.resolve({ data: require('./data/expertColorPicksEndpoint.json') })
    case COLLECTION_SUMMARIES_ENDPOINT:
      return Promise.resolve({ data: require('./data/collectionsEndpoint.json') })
    case generateBrandedEndpoint(COLOR_CHUNKS_ENDPOINT, 'sherwin', { language: 'en-US' }):
      return Promise.resolve({ data: require('./data/colorChunksEndpoint.json') })
    case generateBrandedEndpoint(COLOR_FAMILY_NAMES_ENDPOINT, 'sherwin', { language: 'en-US' }):
      return Promise.resolve({ data: require('./data/colorFamilyNamesEndpoint.json') })
    case generateBrandedEndpoint(COLOR_BRIGHTS_ENDPOINT, 'sherwin', { language: 'en-US' }):
      return Promise.resolve({ data: require('./data/colorBrightsEndpoint.json') })
    case generateBrandedEndpoint(COLORS_ENDPOINT, 'sherwin', { language: 'en-US' }):
      return Promise.resolve({ data: require('./data/colorsEndpoint.json') })
    default:
      console.log('mocked axios called get with un-implemented url: ' + url)
      return Promise.resolve({})
  }
}

export default axios
