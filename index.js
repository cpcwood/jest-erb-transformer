"use strict"

var childProcess = require('child_process')
var deasync = require('deasync')
var path = require('path')
var rubyTransformerPath = path.join(__dirname, 'erb_transformer.rb')

function erbTransformer(fileContent) {
  var child = childProcess.spawn('ruby', [rubyTransformerPath], { stdio: ['pipe', 'pipe', process.stderr] })
  var childProcessClosed = false
  var dataBuffers = []

  child.stdout.on('data', (data) => {
    dataBuffers.push(data)
  })

  child.on('close', function(code, signal) {
    childProcessClosed = true
  })

  child.stdin.write(fileContent)
  child.stdin.end()
 
  // Currently Jest transformers must be synchronous and cannot return promises
  deasync.loopWhile( () => !childProcessClosed )
  
  var compiledFile = dataBuffers.map( b => b.toString() ).join('')
  return compiledFile
}

module.exports = {
  process(fileContent) {
    var result = erbTransformer(fileContent)
    return result
  }
}