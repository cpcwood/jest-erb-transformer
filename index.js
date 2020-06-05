"use strict"

var childProcess = require('child_process')
var path = require('path')

function loadConfig(filePath, jestConfig) {
  // Default Config
  var application = 'ruby'
  var engine = 'erb'
  var rubyTransformerPath = path.join(__dirname, 'erb_transformer.rb')
  var args = [ rubyTransformerPath ]
  
  // User config
  var erbTransformers = jestConfig.transform.filter( e => e[1] === __filename )
  var userConfig = erbTransformers.find( e => (new RegExp(e[0])).test(filePath) )[2]
  if (userConfig.application === 'rails') {
    application = 'bin/rails'
    args.unshift('runner')
  } else if (userConfig.application && userConfig.application !== 'ruby') {
    console.warn(`WARNING - User Configuration: "application": "${userConfig.application}" is not a valid "application" option, using default "${application}" instead!`)
  }
  if (userConfig.engine === 'erubi') {
    args.push('erubi')
  } else { 
    if (userConfig.engine && userConfig.engine !== 'erb') {
      console.warn(`WARNING - User Configuration: "engine": "${userConfig.engine}" is not a valid "engine" option, using default "${engine}" instead!`)
    }
    args.push(engine)
  }
  
  var config = {
    command: application,
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