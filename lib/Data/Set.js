var daggy = require('daggy')

var K = function (x) {
  return function (_) {
    return x
  }
}

function isComparable (x) {
  return x && typeof x.equals === 'function' && typeof x.lte === 'function'
}

function lt (x, y) {
  if (isComparable(x)) {
    return x.lte(y) && !x.equals(y)
  }
  return x < y
}

function gt (x, y) {
  if (isComparable(x)) {
    return !x.lte(y)
  }
  return x > y
}

var _Set = daggy.taggedSum('Set', {
  Tree: ['height', 'value', 'left', 'right'],
  Empty: []
})

_Set.prototype.reduce = function reduce (f, x) {
  return this.cata({
    Empty: K(x),
    Tree: function (_, value, left, right) {
      var accLeft = left.reduce(f, x)
      var accValue = f(accLeft, value)
      return right.reduce(f, accValue)
    }
  })
}

_Set.prototype.filter = function filter (f) {
  return this.reduce(function (acc, x) {
    return f(x) ? acc.insert(x) : acc
  }, empty())
}

// TODO: is this lawful?
_Set.prototype.map = function map (f) {
  return this.reduce(function (acc, x) {
    return acc.insert(f(x))
  }, empty())
}

_Set.prototype.size = function () {
  return this.reduce(function (acc, _) { return acc + 1 }, 0)
}

_Set.prototype.includes = function includes (item) {
  return this.cata({
    Empty: K(false),
    Tree: function (_, value, left, right) {
      if (lt(item, value)) {
        return left.includes(item)
      } else if (gt(item, value)) {
        return right.includes(item)
      }
      return true
    }
  })
}

_Set.prototype.insert = function insert (item) {
  var _this = this
  return this.cata({
    Empty: function () { return singleton(item) },
    Tree: function (_, value, left, right) {
      if (lt(item, value)) {
        return balance(tree(value, left.insert(item), right))
      } else if (gt(item, value)) {
        return balance(tree(value, left, right.insert(item)))
      }
      return _this
    }
  })
}

_Set.prototype.concat = function concat (other) {
  return this.reduce(function (acc, x) {
    if (!acc.insert) {
      console.log(acc)
    }
    return acc.insert(x)
  }, other)
}

_Set.prototype.union = function union (other) {
  return this.concat(other)
}

_Set.prototype.remove = function remove (item) {
  return this.cata({
    Empty: K(this),
    Tree: function (_, value, left, right) {
      if (lt(item, value)) {
        return balance(tree(value, left.remove(item), right))
      } else if (gt(item, value)) {
        return balance(tree(value, left, right.remove(item)))
      }
      return left.union(right)
    }
  })
}

_Set.prototype.intersect = function intersect (other) {
  return this.filter(function (x) {
    return other.includes(x)
  })
}

_Set.prototype.subtract = function subtract (other) {
  return this.filter(function (x) {
    return !other.includes(x)
  })
}

_Set.prototype.symmetricDiff = function symmetricDiff (other) {
  return this.union(other).subtract(this.intersect(other))
}

_Set.prototype.toArray = function toArray () {
  return this.reduce(function (acc, x) {
    acc.push(x)
    return acc
  }, [])
}

function height (set) {
  return set.cata({
    Empty: K(0),
    Tree: function (height) { return height }
  })
}

function tree (value, left, right) {
  return _Set.Tree(
    Math.max(height(left), height(right)) + 1,
    value,
    left,
    right
  )
}

function empty () {
  return _Set.Empty
}

function singleton (item) {
  return _Set.Tree(1, item, empty(), empty())
}

function rotl (set) {
  return set.cata({
    Tree: function (_, value, lessThans, right) {
      return right.cata({
        Tree: function (_, subValue, betweens, greaterThans) {
          return tree(subValue, tree(value, lessThans, betweens), greaterThans)
        },
        Empty: K(set)
      })
    },
    Empty: K(set)
  })
}

function rotr (set) {
  return set.cata({
    Tree: function (_, value, left, greaterThans) {
      return left.cata({
        Tree: function (_, subValue, lessThans, betweens) {
          return tree(subValue, lessThans, tree(value, betweens, greaterThans))
        },
        Empty: K(set)
      })
    },
    Empty: K(set)
  })
}

function heightDifference (set) {
  return set.cata({
    Tree: function (_h, _v, left, right) {
      return height(right) - height(left)
    },
    Empty: K(0)
  })
}

function balance (set) {
  return set.cata({
    Tree: function (_, value, left, right) {
      var diff = heightDifference(set)
      if (diff === -2 && heightDifference(left) === 1) {
        return rotr(tree(value, rotl(left), right))
      } else if (diff < -1) {
        return rotr(set)
      } else if (diff === 2 && heightDifference(right) === -1) {
        return rotl(tree(value, left, rotr(right)))
      } else if (diff > 1) {
        return rotl(set)
      }
      return set
    },
    Empty: K(set)
  })
}

function fromArray (xs) {
  return xs.reduce(function (acc, x) {
    return acc.insert(x)
  }, empty())
}

exports.is = function (x) { return _Set.is(x) }
exports.singleton = singleton
exports.empty = empty
exports.fromArray = fromArray
