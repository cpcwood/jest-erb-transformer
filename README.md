# Jest ERB Transformer

[![npm-version](https://img.shields.io/npm/v/jest-erb-transformer.svg?color=blueviolet&style=flat-square)](https://www.npmjs.com/package/jest-erb-transformer) [![weekly-downloads](https://img.shields.io/npm/dw/jest-erb-transformer.svg?style=flat-square)](https://www.npmjs.com/package/jest-erb-transformer) [![build-status](https://img.shields.io/travis/com/cpcwood/jest-erb-transformer.svg?style=flat-square)](https://travis-ci.com/github/cpcwood/jest-erb-transformer) [![code-coverage](https://img.shields.io/coveralls/github/cpcwood/jest-erb-transformer.svg?style=flat-square)](https://coveralls.io/github/cpcwood/jest-erb-transformer) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg?style=flat-square)](https://standardjs.com)

## Overview 

Custom Jest transformer for compiling Embedded Ruby template files (```.erb```) for use in the Jest JavaScript testing framework.

## Install

Add to project using npm:

```sh
npm install jest-erb-transformer
```

Add to project using Yarn:

```sh
yarn add jest-erb-transformer
```

## Configuration

### Jest Configuration

Ensure the following is included in the project ```package.json``` jest key:

```json
"moduleFileExtensions": [
  "js",
  "erb"
],
```

```json
"transform": {
  "\\.js\\.erb$": "jest-erb-transformer"
}
```

See the [Jest docs](https://jestjs.io/docs/en/configuration#transform-objectstring-pathtotransformer--pathtotransformer-object) for more information on the configuration of transformers.

### Options

To add custom configuration, such as using the Ruby on Rails runner for ERB compilation, add a configuration object to the transformer entry in the ```package.json``` using the Jest syntax, such as:

```json
"transform": {
  "\\.js\\.erb$": [ "jest-erb-transformer", { "application": "rails" } ]
}
```

**Note:** Default options will be applied automatically.

| Key | Default Value | Description |
| :--- | :--- | :--- |
| ```"application"``` | ```"ruby"``` | Transformer is run using ```ruby``` by default, set value to ```"rails"``` to use ```bin/rails runner```. The ```"rails"``` option can be useful if the .erb files include Ruby on Rails specific environment variables such as ```Rails.application.credentails```. |
| ```"engine"``` | ```"erb"``` | Transformer uses the ruby 'ERB' engine by default, to use the [Erubi](https://github.com/jeremyevans/erubi) engine set the value to ```"erubi"```. |
| ```"timeout"``` | ```5000``` | Set the timeout duration in milliseconds for the compilation of individual files (value type: number). |

## License

MIT
