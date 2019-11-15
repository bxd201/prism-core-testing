// import mocks from '../../../__mocks__/helpers/MockUtility'
import MaskObj from '../../../src/store/masks/MaskObj'

const instantiate = (props) => new MaskObj(props)

describe('MaskObj', () => {
  describe('throws an error when instantiated', () => {
    it('has no props', () => {
      expect.assertions(1)
      try {
        instantiate()
      } catch (err) {
        expect(err).toBeTruthy()
      }
    })

    it('has empty props object', () => {
      expect.assertions(1)
      try {
        instantiate({})
      } catch (err) {
        expect(err).toBeTruthy()
      }
    })

    it('has no blob or load', () => {
      expect.assertions(1)
      try {
        instantiate({ id: 'msk1' })
      } catch (err) {
        expect(err).toBeTruthy()
      }
    })

    it('has no id, but does have blob', () => {
      expect.assertions(1)
      try {
        instantiate({ blob: new Blob([]) })
      } catch (err) {
        expect(err).toBeTruthy()
      }
    })

    it('has no id, but does have load', () => {
      expect.assertions(1)
      try {
        instantiate({ load: 'load me' })
      } catch (err) {
        expect(err).toBeTruthy()
      }
    })

    it('has id and blob, but blob is invalid', () => {
      expect.assertions(1)
      try {
        instantiate({ id: 'msk1', blob: 'invalid blob data' })
      } catch (err) {
        expect(err).toBeTruthy()
      }
    })
  })

  describe('does NOT error when instantiated', () => {
    it('has id and blob', () => {
      expect.assertions(0)
      try {
        instantiate({ id: 'id', blob: new Blob([]) })
      } catch (err) {
        expect(err).toBeFalsy()
      }
    })

    it('has id and load', () => {
      expect.assertions(0)
      try {
        instantiate({ id: 'id', load: 'load me' })
      } catch (err) {
        expect(err).toBeFalsy()
      }
    })
  })

  describe('exposes a promise for image data', () => {
    const m = instantiate({ id: 'id', load: 'definitely not something it can load' })

    it('imageData is a Promise', () => {
      expect(m.imageData instanceof Promise).toBeTruthy()
    })
  })

  describe('can be initialized with blob data', () => {
    const m = instantiate({ id: 'id', blob: new Blob([]) })

    it('imageData is a Promise', () => {
      expect(m.imageData instanceof Promise).toBeTruthy()
    })
  })
})
