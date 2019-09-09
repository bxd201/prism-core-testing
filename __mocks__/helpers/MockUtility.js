/**
 * utility adapter class for synchronizing jest API interface
 * in particular spyOn vs jest.fn dealing with restoration and things
 *
 * spyOn allows you to restore the original function
 * jest.fn requires you to implement your own restoration functions
 * this class allows you to forget about it, includes other helpful things
 * @see https://jestjs.io/docs/en/jest-object#jestspyonobject-methodname
 */
function MockUtility () {}

MockUtility.prototype.defaultReturn = function defaultReturn () {
  return arguments.length === 1
    ? arguments[0]
    : Array.from(arguments)
}

MockUtility.prototype.fn = {}

MockUtility.prototype.originals = {}

MockUtility.prototype.createOne = function createOne(name, returns = this.defaultReturn) {
  this.fn[name] = jest.fn(returns)
}

MockUtility.prototype.create = function create (mockNames, returns = this.defaultReturn) {
  mockNames.forEach(name => this.createOne(name, returns))
}

MockUtility.prototype.set = function set (obj, name, returns = this.defaultReturn) {
  this.createOne(name, returns)
  this.originals[name] = this.originals[name] || obj[name]
  obj[name] = this.fn[name]
}

MockUtility.prototype.clearAll = function clearAll () {
  Object.values(this.fn).forEach(mock => mock.mockClear())
}

MockUtility.prototype.restore = function restore (obj, name) {
  if (this.originals[name]) obj[name] = this.originals[name]
}

MockUtility.prototype.restoreAll = function restoreAll (obj) {
  Object.values(this.fn).forEach(name => this.restore(obj, name))
}

export default new MockUtility()