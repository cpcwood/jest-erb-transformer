"use strict"

var fs = require('fs')
const { process } = require('./index')

function transformErb (filePath) {
  var fileContent = fs.readFileSync(filePath).toString()
  return process(fileContent, filePath)
}

test('compiles a simple file', () => {
  expect(transformErb('./tests/helloWorld.js.erb')).toContain("var helloWorld = 'Hello World'")
})

test('compiles a file with the ruby erb engine', () => {
  expect(transformErb('./tests/erbEngine.js.erb')).toContain("var engine = 'erb'")
})