var daggy = require('daggy')
var semver = require('semver')

var Version = daggy.tagged('Version', ['version'])

Version.prototype.equals = function equals (that) {
  return semver.eq(this.version, that.version)
}

Version.prototype.lte = function lte (that) {
  return semver.lte(this.version, that.version)
}

Version.prototype.diff = function diff (that) {
  return semver.diff(this.version, that.version)
}

module.exports = Version
