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

Note: The connected (to Redux) components in this package depend on some of the APIs provided in the `@nteract/core` package. This package depends on a certain version of `@nteract/core` but you can target a particular version by modifying your lock file.

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

The `jupyter-widgets` package supports two types of widgets:
- Standard widgets provided in the official [`jupyter-widgets/base`](https://www.npmjs.com/package/@jupyter-widgets/base) and [`jupyter-widgets/controls`](https://www.npmjs.com/package/@jupyter-widgets/controls) package
- [Custom Widgets](https://ipywidgets.readthedocs.io/en/stable/examples/Widget%20Custom.html) or 3rd party widgets authored by the OSS community

The `WidgetDisplay` component has an additional prop named `customWidgetLoader`  to provide custom loaders for fetching 3rd party widgets. A reference implementation for a custom loader which serves as the default for this package can be found in `widget-loader.ts`.

```typescript
customWidgetLoader?: (moduleName: string, moduleVersion: string) => Promise<any>;
```

### Custom Widgets

Since custom widgets are hosted on CDN, we set https://unkpg.com as our default CDN Base URL. The default base URL can be overriden by specifying another URL via the HTML attribute "data-jupyter-widgets-cdn" on any script tag of the page.

For instance if your JavaScript bundle is loaded as `bundle.js` on your page and you wanted to set [jsdelivr](https://www.jsdelivr.com) as your default CDN url for custom widgets, you could do the following:
```html
<script data-jupyter-widgets-cdn="https://cdn.jsdelivr.net/npm" src="bundle.js"></script>
```
Note: Custom widgets are fetched and loaded using the [requireJS](https://requirejs.org/) library. Please ensure that the library is loaded on your page and that the `require` and `define` APIs are available on the `window` object. We attempt to detect the presence of these APIs and emit a warning that custom widgets won't work when `requirejs` is missing.



## Support

If you experience an issue while using this package or have a feature request, please file an issue on the [issue board](https://github.com/nteract/nteract/issues/new/choose) and add the `pkg:jupyter-widgets` label.

## License

[BSD-3-Clause](https://choosealicense.com/licenses/bsd-3-clause/)
