var daggy = require('daggy')

var Package = daggy.tagged('Package', ['name', 'version'])

Package.prototype.equals = function equals (that) {
  return this.name === that.name && this.version.equals(that.version)
}

Package.prototype.lte = function lte (that) {
  return this.name < that.name || (this.name === that.name && this.version.lte(that.version))
}

module.exports = Package
