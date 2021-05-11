# Jest ERB Transformer

[![npm-version](https://img.shields.io/npm/v/jest-erb-transformer.svg?color=blueviolet&style=flat-square)](https://www.npmjs.com/package/jest-erb-transformer) [![build-status](https://img.shields.io/circleci/build/gh/cpcwood/jest-erb-transformer?style=flat-square)](https://app.circleci.com/pipelines/github/cpcwood/jest-erb-transformer) [![code-coverage](https://img.shields.io/coveralls/github/cpcwood/jest-erb-transformer.svg?style=flat-square)](https://coveralls.io/github/cpcwood/jest-erb-transformer) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg?style=flat-square)](https://standardjs.com)

## Overview 

Custom transformer for compiling Embedded Ruby template files (```.erb```) for use in the Jest JavaScript testing framework.

## Install

Add to project using npm:

```sh
npm install jest-erb-transformer --save-dev
```

Add to project using Yarn:

```sh
yarn add jest-erb-transformer --dev
```

## Configuration

### Jest Configuration

Ensure the ```"erb"``` file extension and the jest-erb-transformer extension matcher and configuration is included in the project's ```package.json``` jest key:

```json
"moduleFileExtensions": [
  "js",
  "erb"
],
```

```json
"transform": {
  "^.+\\.erb$": "jest-erb-transformer"
}
```

See the [Jest docs](https://jestjs.io/docs/en/configuration#transform-objectstring-pathtotransformer--pathtotransformer-object) for more information on the configuration of transformers.

### Options

To add custom configuration, such as using the Ruby on Rails runner for ERB compilation, add a configuration object to the transformer entry in the project ```package.json``` using the [Jest transformer configuration syntax](https://jestjs.io/docs/en/configuration#transform-objectstring-pathtotransformer--pathtotransformer-object). For example, to compile in the rails environment:

```json
"transform": {
  "^.+\\.erb$": [ "jest-erb-transformer", { "application": "rails" } ]
}
```

#### Babel

By default the transformer does not process its output with [Babel](https://babeljs.io/). 

To perform post-processing with Babel, either configure the transformer ```babelConfig``` option as outlined in the options table below, or I have found including the ```.erb``` files in the [babel-jest](https://www.npmjs.com/package/babel-jest) transformer directly has worked in some scenarios. For example:

```json
"transform": {
  "^.+\\.js(?:\\.erb)?$": "babel-jest",
  "^.+\\.erb$": [ "jest-erb-transformer", { "application": "rails" } ]
  }
```

#### All Options

| Key | Default Value | Description |
| :--- | :--- | :--- |
| ```"application"``` | ```"ruby"``` | Transformer is run using ```ruby``` by default, set value to ```"rails"``` to use ```bin/rails runner```. The ```"rails"``` option can be useful if the .erb files include Ruby on Rails specific environment variables such as ```Rails.application.credentails```. |
| ```"engine"``` | ```"erb"``` | Transformer uses the ruby 'ERB' engine by default, to use the [Erubi](https://github.com/jeremyevans/erubi) engine set the value to ```"erubi"```. |
| ```"timeout"``` | ```"5000"``` | Set the timeout duration in milliseconds for the compilation of individual files. |
| ```"babelConfig"``` | ```false``` | Process the output of the ERB transformer using [babel-jest](https://www.npmjs.com/package/babel-jest). <br> Options: <ul><li>```false``` - Disables the use of Babel.</li><li>```true``` - Babel processing using project or file-relative [Babel configuration file](https://babeljs.io/docs/en/config-files).</li><li>```./path/to/.babelrc.json``` - Relative path to Babel configuration file to be used for processing.</li><li>```{ "comments": false }``` - Object containing [Babel options](https://babeljs.io/docs/en/options) to be used for processing.</li></ul> | 
## Contributing

Feel free to ask questions using [issues](https://github.com/cpcwood/jest-erb-transformer/issues) or contribute if you have any improvements.

## License

MIT
