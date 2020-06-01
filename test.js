"use strict"

var fs = require('fs')
const { process } = require('./index')

function transformErb (filePath) {
  var fileContent = fs.readFileSync(filePath).toString()
  return process(fileContent, filePath)
}

test('compiles a simple file', () => {
  expect(transformErb('./tests/helloWorld.js.erb')).toEqual("var helloWorld = 'Hello World'")
})
