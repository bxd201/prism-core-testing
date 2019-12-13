const mockAxios = jest.fn(() => Promise.resolve({}))
mockAxios.get = jest.fn(() => Promise.resolve({}))

export default mockAxios
