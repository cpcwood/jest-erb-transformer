"use strict"

var childProcess = require('child_process')
var path = require('path')

function loadConfig(filePath, jestConfig) {
  // Default Config
  var config = {
    application: 'ruby',
    args: {
      runner: undefined,
      transformer: path.join(__dirname, 'erb_transformer.rb'),
      engine: 'erb',
      delimiter: '__JEST_ERB_TRANSFORMER__'
    },
    timeout: 5000,
    stdio: ['pipe', 'pipe', process.stderr]
  }

  // Load user config
  var erbTransformers = jestConfig.transform.filter( e => e[1] === __filename )
  var userConfig = erbTransformers.find( e => (new RegExp(e[0])).test(filePath) )[2]
  if (userConfig == undefined) {
    console.warn(`WARNING - User Configuration could not be loaded, please check configuration is correct and report to the maintainers!`)
  } else {
    var configKeys = ["application", "engine", "timeout"]
    Object.keys(userConfig).forEach( key => {
      if (!configKeys.includes(key)) {
        console.warn(`WARNING - User Configuration: "${key}" is not a valid configuration key and will be ignored!`)
      }
    })

    // Apply user config
    if (userConfig.engine === 'erubi') {
      config.args.engine = 'erubi'
    } else if (userConfig.engine && userConfig.engine !== config.args.engine) {
      console.warn(`WARNING - User Configuration: "engine": "${userConfig.engine}" is not a valid "engine" value, using default "${config.args.engine}" instead!`)
    }
    if (typeof userConfig.timeout == 'number') {
      config.timeout = userConfig.timeout
    } else if (userConfig.timeout) {
      console.warn(`WARNING - User Configuration: "timeout": "${userConfig.timeout}" is not a valid "timeout" value, using default "${config.timeout}" instead!`)
    }
    if (userConfig.application === 'rails') {
      config.application = 'bin/rails'
      config.args.runner = 'runner'
    } else if (userConfig.application && userConfig.application !== config.application) {
      console.warn(`WARNING - User Configuration: "application": "${userConfig.application}" is not a valid "application" value, using default "${config.application}" instead!`)
    }
  }

  return config
}

function bufferToString(transformerOutput, delimiter) {
  var stringOutput = transformerOutput.toString()
  var fileContentRegex = new RegExp(`${delimiter}([\\s\\S]+)${delimiter}`)
  return stringOutput.match(fileContentRegex)[1]
}

function erbTransformer(fileContent, filePath, config) {
  var child = childProcess.spawnSync(
    config.application,
    Object.values(config.args).filter( e => e !== undefined ),
    { 
      timeout: config.timeout,
      stdio: config.stdio,
      input: fileContent
    }
  )
  if (child.status !== 0) {
    if (child.error && child.error.code == 'ETIMEDOUT') {
      throw(`Compilation of '${filePath}' timed out after ${config.timeout}ms!`)
    } else {
      throw(`Error compiling '${filePath}',  status: '${child.status}', signal: '${child.signal}'!`)
    }
  }
  var compiledFile = bufferToString(child.stdout, config.args.delimiter)
  return compiledFile
}

module.exports = {
  process(fileContent, filePath, jestConfig) {
    var config = loadConfig(filePath, jestConfig)
    return String(erbTransformer(fileContent, filePath, config))
  }
}