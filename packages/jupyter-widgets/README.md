# @nteract/jupyter-widgets

**Note:** The implementation of @nteract/jupyter-widgets is currently in-progress. Please [follow this issue](https://github.com/nteract/nteract/issues/4573).

This package exposes a React component for rendering ipywidgets into a notebook application. It also exposes components for building custom widget renderers.

## Installation

```
$ yarn add @nteract/jupyter-widgets
```

```
$ npm install --save @nteract/jupyter-widgets
```

## Usage

```javascript
import WidgetDisplay from "@nteract/jupyter-widgets";

export default class MyNotebookApp extends ReactComponent {
  render() {
    return <WidgetDisplay data={{ model_id: "widget-model-guid" }} />;
  }
}
```

## Documentation

We're working on adding more documentation for this component. Stay tuned by watching this repository!

## Support

If you experience an issue while using this package or have a feature request, please file an issue on the [issue board](https://github.com/nteract/nteract/issues/new/choose) and add the `pkg:jupyter-widgets` label.

## License

[BSD-3-Clause](https://choosealicense.com/licenses/bsd-3-clause/)
