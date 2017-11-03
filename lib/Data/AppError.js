var daggy = require('daggy')
var combinators = require('../combinators')

var K = combinators.K

var AppError = daggy.taggedSum('AppError', {
  PackageJsonNotFound: ['path'],
  PackageJsonInvalid: [],
  NodeModulesDirectoryNotFound: []
})

AppError.prototype.toString = function toString () {
  return this.cata({
    PackageJsonNotFound: function (p) { return 'Path to package.json not found: ' + p },
    PackageJsonInvalid: K('package.json contains invalid JSON!'),
    NodeModulesDirectoryNotFound: K('Path to node_modules/ directory not found.')
  })
}

AppError.prototype.inspect = function inspect () {
  return this.toString()
}

module.exports = AppError
