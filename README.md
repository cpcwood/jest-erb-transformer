# Jest ERB Transformer

## Overview 

Jest transformer for compiling Embedded Ruby template JavaScript files (.js.erb) for use in the Jest JavaScript testing framework. Based off the [rails-erb-loader](https://github.com/usabilityhub/rails-erb-loader.git).

## Install

Use npm

### Jest Configuration

Developed with Jest version 1.22.4

```
"moduleFileExtensions": [
  "js",
  "js.erb"
],
```

```
"transform": {
  "\\.js.erb$": "jest-erb-transformer"
}
```

## Options

## Usage

## License

MIT