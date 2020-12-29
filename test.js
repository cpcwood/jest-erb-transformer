/* eslint no-undef: 0 */
const fs = require('fs')
const { process } = require('./index')
const path = require('path')

function transformErb (filePath, testConfiguration = {}) {
  const jestConfig = {
    transform: [
      [
        '\\.js.erb$',
        path.join(__dirname, 'index.js'),
        testConfiguration
      ],
      [
        '\\.na\\.erb$',
        path.join(__dirname, 'index.js')
      ]
    ]
  }
  const fileContent = fs.readFileSync(filePath).toString()
  return process(fileContent, filePath, jestConfig)
}

// Hooks
// ========================
afterEach(() => {
  jest.restoreAllMocks()
})

// Features
// ========================
test('compiles a simple file', () => {
  expect(transformErb('./tests/helloWorld.js.erb')).toEqual("var helloWorld = 'Hello World'")
})

test('empty file', () => {
  expect(transformErb('./tests/emptyFile.js.erb')).toEqual('')
})

test('compiles a file with the ruby erb engine', () => {
  expect(transformErb('./tests/erbEngine.js.erb').trim()).toEqual("var engine = 'erb'")
})

test('user config - rails application', () => {
  const testConfig = { application: 'rails' }
  expect(transformErb('./tests/configApplication.js.erb', testConfig)).toEqual("var application = 'rails'")
})

test('user config - ruby application', () => {
  const testConfig = { application: 'ruby' }
  expect(transformErb('./tests/configApplication.js.erb', testConfig)).toEqual("var application = 'ruby'")
})

test('user config - erubi compiler', () => {
  const testConfig = { engine: 'erubi' }
  expect(transformErb('./tests/erbEngine.js.erb', testConfig).trim()).toEqual("var engine = 'erubi'")
})

test('user config - erb compiler', () => {
  const testConfig = { engine: 'erb' }
  expect(transformErb('./tests/erbEngine.js.erb', testConfig).trim()).toEqual("var engine = 'erb'")
})

test('user config - timeout', () => {
  const testConfig = { timeout: 450 }
  expect(() => {
    transformErb('./tests/configSleep500.js.erb', testConfig)
  }).toThrow("Compilation of './tests/configSleep500.js.erb' timed out after 450ms!")
})

test('user config - babelConfig false', () => {
  const testConfig = { babelConfig: false }
  const result = transformErb('./tests/es6.js.erb', testConfig)
  expect(result).toEqual("\n\n// a comment\n\nexport const ACCOUNT_PATH = '/account';\n\n")
})

test('user config - babelConfig true', () => {
  const testConfig = { babelConfig: true }
  const result = transformErb('./tests/es6.js.erb', testConfig)
  expect(result).toContain('exports.ACCOUNT_PATH = ACCOUNT_PATH;')
  expect(result).toContain('a comment')
})

test('user config - babelConfig path', () => {
  const testConfig = { babelConfig: './tests/testBabelConfig.js' }
  const result = transformErb('./tests/es6.js.erb', testConfig)
  expect(result).toContain('exports.ACCOUNT_PATH = ACCOUNT_PATH;')
  expect(result).not.toContain('a comment')
})

test('user config - babelConfig inline', () => {
  const testConfig = {
    babelConfig: {
      comments: false,
      minified: true
    }
  }
  const result = transformErb('./tests/es6.js.erb', testConfig)
  expect(result).toContain('exports.ACCOUNT_PATH=ACCOUNT_PATH;')
  expect(result).not.toContain('a comment')
})

// Warnings
// ========================
test('user config - warning - invalid configuration key entered', () => {
  const testConfig = { 'not-a-key': 'value' }
  const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
  transformErb('./tests/helloWorld.js.erb', testConfig)
  expect(consoleSpy).toHaveBeenLastCalledWith('WARNING - User Configuration: "not-a-key" is not a valid configuration key and will be ignored!')
})

test('user config - warning - invalid rails option entered', () => {
  const testConfig = { application: 'not-a-value' }
  const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
  transformErb('./tests/helloWorld.js.erb', testConfig)
  expect(consoleSpy).toHaveBeenLastCalledWith('WARNING - User Configuration: "application": "not-a-value" is not a valid "application" value, using default value instead!')
})

test('user config - warning - invalid engine type entered', () => {
  const testConfig = { engine: 'not-an-engine' }
  const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
  transformErb('./tests/helloWorld.js.erb', testConfig)
  expect(consoleSpy).toHaveBeenLastCalledWith('WARNING - User Configuration: "engine": "not-an-engine" is not a valid "engine" value, using default value instead!')
})

test('user config - warning - invalid timeout type entered', () => {
  const testConfig = { timeout: 'not-an-number' }
  const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
  transformErb('./tests/helloWorld.js.erb', testConfig)
  expect(consoleSpy).toHaveBeenLastCalledWith('WARNING - User Configuration: "timeout": "not-an-number" is not a valid "timeout" value, using default value instead!')
})

test('user config - warning - invalid babelConfig type entered', () => {
  const testConfig = { babelConfig: 1 }
  const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
  transformErb('./tests/helloWorld.js.erb', testConfig)
  expect(consoleSpy).toHaveBeenLastCalledWith('WARNING - User Configuration: "babelConfig": "1" is not a valid "babelConfig" value, using default value instead!')
})

test('user config - warning - could not be loaded', () => {
  const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
  transformErb('./tests/configNotLoaded.na.erb')
  expect(consoleSpy).toHaveBeenLastCalledWith('WARNING - User Configuration could not be loaded, please check configuration is correct and report to the maintainers!')
})

// Errors
// ========================
test('error - general failure of childProcess.spawnSync', () => {
  expect(() => {
    transformErb('./tests/rubyError.js.erb')
  }).toThrow("Error compiling './tests/rubyError.js.erb',  status: '1', signal: 'null', error: (erb):1:in `<main>': A ruby error (RuntimeError)")
})
