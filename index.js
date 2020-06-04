"use strict"

var childProcess = require('child_process')
var path = require('path')

function loadConfig(filePath, jestConfig) {
  // Default Config
  var command = 'ruby'
  var rubyTransformerPath = path.join(__dirname, 'erb_transformer.rb')
  var args = [
    rubyTransformerPath
  ]
  
  // User config
  var erbTransformers = jestConfig.transform.filter( e => e[1] == __filename )
  var userConfig = erbTransformers.find( e => (new RegExp(e[0])).test(filePath) ).pop()
  if (userConfig.rails == true) {
    command = 'bin/rails'
    args.unshift('runner')
  }
  
  var config = {
    command: command,
    arguments: args 
  }
  return config
}

function erbTransformer(fileContent, config) {
  var child = childProcess.spawnSync(
    config.command,
    config.arguments,
    { 
      stdio: ['pipe', 'pipe', process.stderr],
      input: fileContent
    }
  )
  var compiledFile = child.stdout.toString()
  return compiledFile
}

module.exports = {
  process(fileContent, filePath, jestConfig) {
    var config = loadConfig(filePath, jestConfig)
    return String(erbTransformer(fileContent, config))
  }
}