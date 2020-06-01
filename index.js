"use strict"

module.exports = {
  process(fileContent, filePath) {
    // Log options and return unchanged file
    console.log('filePath', filePath)
    console.log('fileContent', fileContent)
    return fileContent
  }
}