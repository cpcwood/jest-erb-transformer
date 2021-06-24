const childProcess = require('child_process')
const path = require('path')
const babelJest = require('babel-jest')

function loadConfig (filePath, jestConfig) {
  // Default Config
  const config = {
    application: 'ruby',
    args: {
      runner: undefined,
      windowsRunner: undefined,
      transformer: path.join(__dirname, 'erb_transformer.rb'),
      engine: 'erb',
      delimiter: '__JEST_ERB_TRANSFORMER__'
    },
    timeout: 5000,
    stdio: ['pipe', 'pipe', 'pipe'],
    babelConfig: false
  }

  // User options
  const userOptions = {
    application: {
      tester: new RegExp(`^(rails|${config.application})$`),
      applyToConfig: value => {
        if (/^win/.test(process.platform) && value === 'rails') {
          config.args.runner = 'bin\\rails'
          config.args.windowsRunner = 'runner'
        } else if (value === 'rails') {
          config.application = 'bin/rails'
          config.args.runner = 'runner'
        } else {
          config.args.application = value
        }
      }
    },
    engine: {
      tester: new RegExp(`^(erubi|${config.args.engine})$`),
      applyToConfig: value => {
        config.args.engine = value
      }
    },
    timeout: {
      tester: { test: value => /^(\d+(?:\.\d*)?)$/.test(value.toString()) },
      applyToConfig: userTimeout => {
        config.timeout = parseInt(userTimeout)
      }
    },
    babelConfig: {
      tester: { test: value => ['boolean', 'string', 'object'].includes(typeof value) },
      applyToConfig: userBabelConfig => {
        if (userBabelConfig.toString() === 'true') {
          config.babelConfig = {}
        } else if (typeof userBabelConfig === 'string') {
          config.babelConfig = {
            configFile: userBabelConfig
          }
        } else if (typeof userBabelConfig === 'object') {
          config.babelConfig = userBabelConfig
        } else {
          config.babelConfig = false
        }
      }
    }
  }

  // Load user config
  const erbTransformers = jestConfig.transform.filter(e => e[1] === __filename)
  const userConfig = erbTransformers.find(e => (new RegExp(e[0])).test(filePath))[2]
  if (userConfig === undefined) {
    console.warn('WARNING - User Configuration could not be loaded, please check configuration is correct and report to the maintainers!')
  } else {
    // Apply user config
    for (const [key, value] of Object.entries(userConfig)) {
      const selectedOption = userOptions[key]
      if (selectedOption === undefined) {
        console.warn(`WARNING - User Configuration: "${key}" is not a valid configuration key and will be ignored!`)
      } else {
        const isValidValue = selectedOption.tester.test(value)
        if (isValidValue) {
          selectedOption.applyToConfig(value)
        } else {
          console.warn(`WARNING - User Configuration: "${key}": "${value}" is not a valid "${key}" value, using default value instead!`)
        }
      }
    }
  }
  return config
}

function bufferToString (transformerOutput, delimiter) {
  const stringOutput = transformerOutput.toString()
  const fileContentRegex = new RegExp(`${delimiter}([\\s\\S]*)${delimiter}`)
  return stringOutput.match(fileContentRegex)[1]
}

function erbTransformer (fileContent, filePath, config) {
  const child = childProcess.spawnSync(
    config.application,
    Object.values(config.args).filter(e => e !== undefined),
    {
      timeout: config.timeout,
      stdio: config.stdio,
      input: fileContent
    }
  )
  if (child.status !== 0) {
    if (child.error && child.error.code === 'ETIMEDOUT') {
      throw new Error(`Compilation of '${filePath}' timed out after ${config.timeout}ms!`)
    } else {
      throw new Error(`Error compiling '${filePath}', status: '${child.status}', signal: '${child.signal}', error: ${child.stderr ? child.stderr.toString() : 'undefined'}`)
    }
  }
  const compiledFile = bufferToString(child.stdout, config.args.delimiter)
  return compiledFile
}

function processFile (fileContent, filePath, config) {
  let processedContent = String(erbTransformer(fileContent, filePath, config))
  if (config.babelConfig) {
    const babelTransformer = babelJest.createTransformer(config.babelConfig)
    processedContent = babelTransformer.process(processedContent, filePath, {}).code
  }
  return processedContent
}

module.exports = {
  process (fileContent, filePath, jestConfig) {
    const config = loadConfig(filePath, jestConfig.config)
    return processFile(fileContent, filePath, config)
  }
}
