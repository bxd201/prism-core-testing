// polyfilling browser Intl object
import '@formatjs/intl-relativetimeformat/polyfill'
import '@formatjs/intl-relativetimeformat/polyfill-locales'
// including all imported fontawesome icons so tests stop complaining
import { configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
// TODO:noah.hall
// @see https://github.com/nock/nock#axios
import axios from 'axios'

axios.defaults.adapter = require('axios/lib/adapters/http')
configure({ adapter: new Adapter() })
