"use strict"

var childProcess = require('child_process')
var path = require('path')

function loadConfig(filePath, jestConfig) {
  // Default Config
  var application = 'ruby'
  var engine = 'erb'
  var timeout = 5000
  var rubyTransformerPath = path.join(__dirname, 'erb_transformer.rb')
  var args = [ rubyTransformerPath ]

  // Load user config
  var erbTransformers = jestConfig.transform.filter( e => e[1] === __filename )
  var userConfig = erbTransformers.find( e => (new RegExp(e[0])).test(filePath) )[2]
  var configKeys = ["application", "engine", "timeout"]
  Object.keys(userConfig).forEach( key => {
    if (!configKeys.includes(key)) {
      console.warn(`WARNING - User Configuration: "${key}" is not a valid configuration key and will be ignored!`)
    }
  })

  // Apply user config
  if (userConfig.application === 'rails') {
    application = 'bin/rails'
    args.unshift('runner')
  } else if (userConfig.application && userConfig.application !== 'ruby') {
    console.warn(`WARNING - User Configuration: "application": "${userConfig.application}" is not a valid "application" value, using default "${application}" instead!`)
  }
  if (userConfig.engine === 'erubi') {
    args.push('erubi')
  } else { 
    if (userConfig.engine && userConfig.engine !== 'erb') {
      console.warn(`WARNING - User Configuration: "engine": "${userConfig.engine}" is not a valid "engine" value, using default "${engine}" instead!`)
    }
    args.push(engine)
  }
  if (userConfig.timeout && typeof userConfig.timeout == 'number') {
    timeout = userConfig.timeout
  }
  
  var config = {
    command: application,
    arguments: args,
    timeout: timeout
  }
  return config
}

function erbTransformer(fileContent, filePath, config) {
  var child = childProcess.spawnSync(
    config.command,
    config.arguments,
    { 
      stdio: ['pipe', 'pipe', process.stderr],
      input: fileContent,
      timeout: config.timeout
    }
  )
  // console.log(child)
  if (child.signal !== null) {
    if (child.error.code == 'ETIMEDOUT') {
      throw(`Compilation of '${filePath}' timed out after ${config.timeout}ms!`)
    } else {
      throw(`Error compiling '${filePath}', signal: '${child.signal}', code: '${child.error.code}'!`)
    }
  }
  var compiledFile = child.stdout.toString()
  return compiledFile
}

module.exports = {
  process(fileContent, filePath, jestConfig) {
    var config = loadConfig(filePath, jestConfig)
    return String(erbTransformer(fileContent, filePath, config))
  }
}