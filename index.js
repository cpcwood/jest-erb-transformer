"use strict"

var childProcess = require('child_process')
var path = require('path')
var rubyTransformerPath = path.join(__dirname, 'erb_transformer.rb')

function erbTransformer(fileContent) {
  var child = childProcess.spawnSync(
    'ruby', 
    [ 
      rubyTransformerPath
    ], 
    { 
      stdio: ['pipe', 'pipe', process.stderr],
      input: fileContent
    }
  )
  var compiledFile = child.stdout.toString()
  return compiledFile
}

module.exports = {
  process(fileContent) {
    var result = erbTransformer(fileContent)
    return result
  }
}