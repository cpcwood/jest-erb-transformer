# Jest ERB Transformer

## Overview 

Jest transformer for compiling Embedded Ruby template JavaScript files (.js.erb) for use in the Jest JavaScript testing framework. Based off the [rails-erb-loader](https://github.com/usabilityhub/rails-erb-loader.git).

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
  "\\.js.erb$": "jest-erb-transformer"
}
```

### Additional Options

tbc

## Usage

tbc

## License

MIT