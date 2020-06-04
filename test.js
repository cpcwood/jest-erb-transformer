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

test('loads application rails from config', () => {
  var testConfig = { rails: true }
  expect(transformErb('./tests/configApplication.js.erb', testConfig)).toContain("var application = 'rails'")
})