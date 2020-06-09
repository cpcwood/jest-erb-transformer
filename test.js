"use strict"

var fs = require('fs')
const { process } = require('./index')
var path = require('path')
var childProcess = require('child_process')

function transformErb (filePath, testConfiguration = {}) {
  var jestConfig = {
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
  var fileContent = fs.readFileSync(filePath).toString()
  return process(fileContent, filePath, jestConfig)
}


// Hooks
afterEach(() => {    
  jest.restoreAllMocks();
})


// Features
test('compiles a simple file', () => {
  expect(transformErb('./tests/helloWorld.js.erb')).toEqual("var helloWorld = 'Hello World'")
})

test('empty file', () => {
  expect(transformErb('./tests/emptyFile.js.erb')).toEqual("")
})

test('compiles a file with the ruby erb engine', () => {
  expect(transformErb('./tests/erbEngine.js.erb')).toEqual("\nvar engine = 'erb'")
})

test('user config - rails application', () => {
  var testConfig = { "application": "rails" }
  expect(transformErb('./tests/configApplication.js.erb', testConfig)).toEqual("var application = 'rails'")
})

test('user config - erubi compiler', () => {
  var testConfig = { "engine": "erubi" }
  expect(transformErb('./tests/erbEngine.js.erb', testConfig)).toEqual("var engine = 'erubi'")
})

test('user config - timeout', () => {
  var testConfig = { "timeout": 450 }
  expect( () => {
    transformErb('./tests/configSleep500.js.erb', testConfig)
  }).toThrow("Compilation of './tests/configSleep500.js.erb' timed out after 450ms!")
})

// Warnings
test('user config - warning - invalid configuration key entered', () => {
  var testConfig = { "not-a-key": "value" }
  var consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
  transformErb('./tests/helloWorld.js.erb', testConfig)
  expect(consoleSpy).toHaveBeenLastCalledWith("WARNING - User Configuration: \"not-a-key\" is not a valid configuration key and will be ignored!")
})

test('user config - warning - invalid rails option entered', () => {
  var testConfig = { "application": 'not-a-value' }
  var consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
  transformErb('./tests/helloWorld.js.erb', testConfig)
  expect(consoleSpy).toHaveBeenLastCalledWith("WARNING - User Configuration: \"application\": \"not-a-value\" is not a valid \"application\" value, using default \"ruby\" instead!")
})

test('user config - warning - invalid engine type entered', () => {
  var testConfig = { "engine": 'not-an-engine' }
  var consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
  transformErb('./tests/erbEngine.js.erb', testConfig)
  expect(consoleSpy).toHaveBeenLastCalledWith("WARNING - User Configuration: \"engine\": \"not-an-engine\" is not a valid \"engine\" value, using default \"erb\" instead!")
})

test('user config - warning - invalid timeout type entered', () => {
  var testConfig = { "timeout": 'not-an-number' }
  var consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
  transformErb('./tests/erbEngine.js.erb', testConfig)
  expect(consoleSpy).toHaveBeenLastCalledWith("WARNING - User Configuration: \"timeout\": \"not-an-number\" is not a valid \"timeout\" value, using default \"5000\" instead!")
})

test('user config - warning - could not be loaded', () => {
  var consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
  transformErb('./tests/configNotLoaded.na.erb')
  expect(consoleSpy).toHaveBeenLastCalledWith("WARNING - User Configuration could not be loaded, please check configuration is correct and report to the maintainers!")
})


// Errors
test('error - general failure of childProcess.spawnSync', () => {
  jest.spyOn(childProcess, 'spawnSync').mockImplementation( () => { return {status: 1, signal: 'test', error: 'test'} })
  expect( () => {
    transformErb('./tests/helloWorld.js.erb')
  }).toThrow("Error compiling './tests/helloWorld.js.erb',  status: '1', signal: 'test', error: test!")
})