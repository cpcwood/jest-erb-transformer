"use strict"

var fs = require('fs')
const { process } = require('./index')
var path = require('path')


function transformErb (filePath, testConfiguration) {
  var jestConfig = {
    transform: [
      [
        '\\.js.ab',
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

test('compiles a simple file', () => {
  var testConfig = {}
  expect(transformErb('./tests/helloWorld.js.erb', testConfig)).toContain("var helloWorld = 'Hello World'")
})

test('compiles a file with the ruby erb engine', () => {
  var testConfig = {}
  expect(transformErb('./tests/erbEngine.js.erb', testConfig)).toContain("var engine = 'erb'")
})

test('user config - rails application', () => {
  var testConfig = { rails: true }
  expect(transformErb('./tests/configApplication.js.erb', testConfig)).toContain("var application = 'rails'")
})

test('user config - erubi compiler', () => {
  var testConfig = { engine: 'erubi' }
  expect(transformErb('./tests/erbEngine.js.erb', testConfig)).toContain("var engine = 'erubi'")
})

test('user config - invalid engine type entered', () => {
  var testConfig = { engine: 'not-an-engine' }
  const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
  transformErb('./tests/erbEngine.js.erb', testConfig)
  expect(consoleSpy).toHaveBeenLastCalledWith("User Configuration: engine: 'not-an-engine' is not a valid engine option, using 'erb' instead")
  consoleSpy.mockRestore()
})