exports.I = function I (x) {
  return x
}

exports.K = function K (x) {
  return function (_) {
    return x
  }
}
