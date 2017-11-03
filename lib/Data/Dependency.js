var daggy = require('daggy')

// TODO: is this even needed?
var Dependency = daggy.tagged('Dependency', ['name', 'version'])

module.exports = Dependency
