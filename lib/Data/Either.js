var daggy = require('daggy')

var Either = daggy.taggedSum('Either', {
  Right: ['value'],
  Left: ['error']
})

Either.of = Either.Right
Either.prototype.of = Either.Right

Either.prototype.map = function map (f) {
  return this.cata({
    Right: function (value) { return Either.Right(f(value)) },
    Left: function (_) { return this }
  })
}

Either.prototype.chain = function chain (f) {
  return this.cata({
    Right: f,
    Left: function (_) { return this }
  })
}

Either.prototype.fold = function fold (f, g) {
  return this.cata({
    Right: f,
    Left: g
  })
}

Either.tryCatch = function tryCatch (f) {
  return function () {
    try {
      return Either.Right(f.apply(null, arguments))
    } catch (err) {
      return Either.Left(err)
    }
  }
}

module.exports = Either
