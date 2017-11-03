var test = require('tape')
var Version = require('../../lib/Data/Version')

test('Version - Setoid laws', function (t) {
  var a = Version('1.2.3')
  var b = Version('3.2.1')
  var c = Version('1.2.3')
  var d = Version('1.2.3')

  t.ok(a.equals(c), 'obeys reflexifity law')
  t.ok(
    (a.equals(b) === b.equals(a)) &&
    (a.equals(c) === c.equals(a)),
    'obeys symmetry law'
  )
  t.ok(
    (a.equals(c) && c.equals(d) && a.equals(d)),
    'obeys transitivity law'
  )
  t.end()
})

test('Version - Ord laws', function (t) {
  var a = Version('1.2.3')
  var b = Version('3.2.1')
  var c = Version('1.2.3')
  var d = Version('4.0.0')

  t.ok(
    a.lte(b) || b.lte(a),
    'obeys totality law'
  )
  t.ok(
    a.lte(c) && c.lte(a) && a.equals(c),
    'obeys antisymmetry law'
  )
  t.ok(
    a.lte(b) && b.lte(d) && a.lte(d),
    'obeys transitivity law'
  )
  t.end()
})
