"use strict"

var fs = require('fs')
const { process } = require('./index')
var path = require('path')


function transformErb (filePath, testConfiguration) {
  var jestConfig = {
    transform: [
      [
        '\\.js\\.ab$',
        path.join(__dirname, 'index.js'),
        { 'rails': 'false' }
      ],
      [
        '\\.js.erb$',
        path.join(__dirname, 'index.js'),
        testConfiguration
      ]
    ]
  }
  var fileContent = fs.readFileSync(filePath).toString()
  return process(fileContent, filePath, jestConfig)
}

// Features
test('compiles a simple file', () => {
  var testConfig = {}
  expect(transformErb('./tests/helloWorld.js.erb', testConfig)).toContain("var helloWorld = 'Hello World'")
})

test('compiles a file with the ruby erb engine', () => {
  var testConfig = {}
  expect(transformErb('./tests/erbEngine.js.erb', testConfig)).toContain("var engine = 'erb'")
})

test('user config - rails application', () => {
  var testConfig = { "application": "rails" }
  expect(transformErb('./tests/configApplication.js.erb', testConfig)).toContain("var application = 'rails'")
})

test('user config - erubi compiler', () => {
  var testConfig = { "engine": "erubi" }
  expect(transformErb('./tests/erbEngine.js.erb', testConfig)).toContain("var engine = 'erubi'")
})

test('user config - timeout', () => {
  var testConfig = { "timeout": 450 }
  expect( () => {
    transformErb('./tests/configSleep500.js.erb', testConfig)
  }).toThrow(`Compilation of './tests/configSleep500.js.erb' timed out after 450ms!`)
})

// Warnings
test('user config - invalid configuration key entered', () => {
  var testConfig = { "not-a-key": "value" }
  var consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
  transformErb('./tests/helloWorld.js.erb', testConfig)
  expect(consoleSpy).toHaveBeenLastCalledWith("WARNING - User Configuration: \"not-a-key\" is not a valid configuration key and will be ignored!")
  consoleSpy.mockRestore()
})

test('user config - invalid rails option entered', () => {
  var testConfig = { "application": 'not-a-value' }
  var consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
  transformErb('./tests/helloWorld.js.erb', testConfig)
  expect(consoleSpy).toHaveBeenLastCalledWith("WARNING - User Configuration: \"application\": \"not-a-value\" is not a valid \"application\" value, using default \"ruby\" instead!")
  consoleSpy.mockRestore()
})

test('user config - invalid engine type entered', () => {
  var testConfig = { "engine": 'not-an-engine' }
  var consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
  transformErb('./tests/erbEngine.js.erb', testConfig)
  expect(consoleSpy).toHaveBeenLastCalledWith("WARNING - User Configuration: \"engine\": \"not-an-engine\" is not a valid \"engine\" value, using default \"erb\" instead!")
  consoleSpy.mockRestore()
})

test('user config - invalid timeout type entered', () => {
  var testConfig = { "timeout": 'not-an-number' }
  var consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
  transformErb('./tests/erbEngine.js.erb', testConfig)
  expect(consoleSpy).toHaveBeenLastCalledWith("WARNING - User Configuration: \"timeout\": \"not-an-number\" is not a valid \"timeout\" value, using default \"5000\" instead!")
  consoleSpy.mockRestore()
})

// timeout incorrect type

// Errors
