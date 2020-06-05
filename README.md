# Jest ERB Transformer

## Overview 

Jest transformer for compiling Embedded Ruby template JavaScript files (.js.erb) for use in the Jest JavaScript testing framework.

Developed with Jest version 1.22.4

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
  "js.erb"
],
```

```json
"transform": {
  "\\.js\\.erb$": "jest-erb-transformer"
}
```

### Options

To add custom configuration, such as using the Ruby on Rails runner for ERB compilation, add a configuration object to the transformer entry in the ```package.json``` using the Jest syntax, such as:

```json
"transform": {
  "\\.js\\.erb$": [ "jest-erb-transformer", { "application": "rails" } ]
}
```

Default options will be applied automatically, 

| Key | Default Value | Description |
| :--- | :--- | :--- |
| ```"application"``` | ```"ruby"``` | Transformer is run using ```ruby``` by default, set value to ```"rails"``` to use ```bin/rails runner```. The ```"rails"``` option can be useful if the .erb files include Ruby on Rails specific environment variables such as ```Rails.application.credentails```. |
| ```"engine"``` | ```"erb"``` | Transformer uses the ruby 'ERB' engine by default, to use the [Erubi](https://github.com/jeremyevans/erubi) engine set the value to ```"erubi"```. |


## License

MIT