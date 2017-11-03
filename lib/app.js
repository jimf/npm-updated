var fs = require('fs')
var path = require('path')
var AppError = require('./Data/AppError')
var Either = require('./Data/Either')
var List = require('./Data/List')
var Package = require('./Data/Package')
var _Set = require('./Data/Set')
var Task = require('./Data/Task')
var Version = require('./Data/Version')
var combinators = require('./combinators')

var I = combinators.I
var K = combinators.K

var readFile = function readFile (path) {
  return new Task(function (reject, resolve) {
    fs.readFile(path, 'utf-8', function (err, data) {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}

var parseJson = Either.tryCatch(JSON.parse)

/**
 * Extract the set of dependency/devDependency names from package.json.
 *
 * @summary Object → Task AppError (Set String)
 */
function getPackageJsonDependencies (o) {
  return readFile(o.packageJsonPath).bimap(K(AppError.PackageJsonNotFound(o.packageJsonPath)), I)
    .chain(function (jsonString) {
      return Task.fromEither(parseJson(jsonString)).bimap(K(AppError.PackageJsonInvalid), I)
    })
    .map(function (pkg) {
      // TODO: support option to suppress dev dependencies
      return _Set.fromArray(
        Object.keys(pkg.dependencies || {})
          .concat(Object.keys(pkg.devDependencies || {}))
      )
    })
}

/**
 * Extract name/version information from the package.json file for a given
 * package in a given node_modules directory.
 *
 * @summary String → String → Task AppError (List Package)
 */
function getPackageDetail (nodeModsPath) {
  return function (pkgName) {
    // TODO: apply app errors
    return readFile(path.join(nodeModsPath, pkgName, 'package.json'))
      .chain(function (jsonString) {
        return Task.fromEither(parseJson(jsonString))
      })
      .map(function (pkg) {
        return Package(pkgName, Version(pkg.version))
      })
  }
}

/**
 * Given a set of package names and a node_modules directory path, look up
 * each of the packages in the given node_modules directory and parse the
 * respective package.json file for the package, extracting version
 * information.
 *
 * @summary Set String → String → Task AppError (Set Package)
 */
function lookupDependencyVersions (pkgNames) {
  return function (nodeModulesDir) {
    return List.fromArray(pkgNames.toArray())
      .traverse(Task, getPackageDetail(nodeModulesDir))
      .map(function (pkgList) {
        return _Set.fromArray(pkgList.toArray())
      })
  }
}

/**
 * Given a set of package names, simultaneously look up each of the packages in
 * both the current and backup node_modules directories and parse the
 * respective package.json files for those packages, extracting version
 * information.
 *
 * @summary Object → Set String → Task AppError (List (Set Package))
 */
function lookupCurrentAndBackupDependencyVersions (o) {
  return function (pkgNames) {
    return List.fromArray([o.nodeModulesDir, o.backupNodeModulesDir])
      .traverse(Task, lookupDependencyVersions(pkgNames))
  }
}

/**
 * Given a list of 2 sets of packages, return the set of packages that ONLY
 * appear in the first set OR the second set.
 *
 * @summary List (Set Package) → Set Package
 */
function getSymmetricDifference (list) {
  var ds = list.toArray()
  return ds[0].symmetricDiff(ds[1])
}

/**
 * Given the set of packages whose versions differ between the current and
 * backup node_modules directories, process the differences and roll up into
 * an array of difference data.
 *
 * @summary Set Package → Array Object
 */
function getResults (pkgDiffSet) {
  return pkgDiffSet.reduce(function (acc, pkg) {
    if (acc.previous) {
      acc.result.push({
        package: pkg.name,
        current: pkg.version.version,
        backup: acc.previous.version.version,
        diff: acc.previous.version.diff(pkg.version)
      })
      delete acc.previous
    } else {
      acc.previous = pkg
    }
    return acc
  }, { result: [] }).result
}

var app = function (o) {
  return getPackageJsonDependencies(o)
    .chain(lookupCurrentAndBackupDependencyVersions(o))
    .map(getSymmetricDifference)
    .map(getResults)
}

module.exports = app
