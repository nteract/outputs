# @nteract/transform-model-debug

This package contains a React component that can be used to render the state of a comms model.

## Installation

```
$ yarn add @nteract/transform-model-debug
```

```
$ npm install --save @nteract/transform-model-debug
```

## Usage

```javascript
import ModelDebug from "@nteract/transform-model-debug";

export default () => {
  return <ModelDebug data={"hey"} models={{ 1: { fun: true } }} />;
};
```

## Documentation

We're working on adding more documentation for this component. Stay tuned by watching this repository!

## Support

If you experience an issue while using this package or have a feature request, please file an issue on the [issue board](https://github.com/nteract/nteract/issues/new/choose) and add the `pkg:transform-model-debug` label.

## License

[BSD-3-Clause](https://choosealicense.com/licenses/bsd-3-clause/)
