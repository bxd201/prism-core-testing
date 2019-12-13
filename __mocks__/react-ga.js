export default {
  ...jest.requireActual('react-ga'),
  set: jest.fn(),
  pageview: jest.fn(),
  ReactGA: jest.fn()
}
