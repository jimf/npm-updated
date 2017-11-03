var daggy = require('daggy')

function liftA2 (f, x, y) {
  return x.map(f).ap(y)
}

function append (item) {
  return function (xs) {
    return xs.concat(List.of(item))
  }
}

var List = daggy.taggedSum('List', {
  Cons: ['head', 'tail'],
  Nil: []
})

List.empty = function () {
  return List.Nil
}

List.of = function of (value) {
  return List.Cons(value, List.empty())
}

List.cons = function (value, list) {
  return List.Cons(value, list)
}

List.prototype.reduce = function reduce (f, x) {
  function go (a, b) {
    return a.cata({
      Nil: function () { return b },
      Cons: function (head, tail) {
        return go(a.tail, f(b, a.head))
      }
    })
  }
  return go(this, x)
}

List.prototype.map = function map (f) {
  var _this = this
  return this.cata({
    Nil: function () { return _this },
    Cons: function (head, tail) {
      return List.cons(f(head), tail.map(f))
    }
  })
}

List.prototype.reverse = function reverse () {
  return this.reduce(function (acc, x) {
    return List.Cons(x, acc)
  }, List.empty())
}

List.prototype.size = function size () {
  return this.reduce(function (acc, x) {
    return acc + 1
  }, 0)
}

List.prototype.concat = function concat (xs) {
  return this.reverse().reduce(function (acc, x) {
    return acc.cata({
      Nil: function () { return x },
      Cons: function () {
        return List.Cons(x, acc)
      }
    })
  }, xs)
}

List.prototype.traverse = function traverse (T, f) {
  return this.reduce(function (acc, x) {
    return liftA2(append, f(x), acc)
  }, T.of(List.empty()))
}

List.prototype.toArray = function toArray () {
  return this.reduce(function (acc, x) {
    acc.push(x)
    return acc
  }, [])
}

List.fromArray = function fromArray (xs) {
  return xs.reduceRight(function (acc, x) {
    return List.cons(x, acc)
  }, List.empty())
}

module.exports = List
