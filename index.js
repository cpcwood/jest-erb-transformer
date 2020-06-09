const childProcess = require('child_process')
const path = require('path')

function loadConfig (filePath, jestConfig) {
  // Default Config
  const config = {
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

  // User options
  const userOptions = {
    application: {
      regex: new RegExp(`^(rails|${config.application})$`),
      applyToConfig: () => {
        config.application = 'bin/rails'
        config.args.runner = 'runner'
      }
    },
    engine: {
      regex: new RegExp(`^(erubi|${config.args.engine})$`),
      applyToConfig: () => {
        config.args.engine = 'erubi'
      }
    },
    timeout: {
      regex: /^(\d+(?:\.\d*)?)$/,
      applyToConfig: (userTimeout) => {
        config.timeout = parseInt(userTimeout)
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
        const isValidValue = selectedOption.regex.test(value.toString())
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
      throw new Error(`Error compiling '${filePath}',  status: '${child.status}', signal: '${child.signal}', error: ${child.error}!`)
    }
  }
  const compiledFile = bufferToString(child.stdout, config.args.delimiter)
  return compiledFile
}

module.exports = {
  process (fileContent, filePath, jestConfig) {
    const config = loadConfig(filePath, jestConfig)
    return String(erbTransformer(fileContent, filePath, config))
  }
}
