var Task = require('data.task')

Task.fromEither = function (either) {
  return either.cata({
    Left: Task.rejected,
    Right: Task.of
  })
}

module.exports = Task
