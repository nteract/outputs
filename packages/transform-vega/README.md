# @nteract/transform-vega

This package contains a React component for rendering interactive visualizations using [Vega](https://vega.github.io/vega/).

## Installation

```
$ yarn add @nteract/transform-vega
```

```
$ npm install --save @nteract/transform-vega
```

## Usage

The example below shows how we can use this package to render a scatterplot.

```javascript
import { Vega3 } from "@nteract/transform-vega";

export default () => {
  return (
    <Vega3
      data={{
        description: "A scatterplot showing horsepower and miles per gallons.",
        data: {
          values: cars
        },
        mark: "point",
        encoding: {
          x: { field: "Horsepower", type: "quantitative" },
          y: { field: "Miles_per_Gallon", type: "quantitative" },
          color: { field: "Origin", type: "nominal" },
          shape: { field: "Origin", type: "nominal" }
        }
      }}
    />
  );
};
```

## Documentation

We're working on adding more documentation for this component. Stay tuned by watching this repository!

## Support

If you experience an issue while using this package or have a feature request, please file an issue on the [issue board](https://github.com/nteract/nteract/issues/new/choose) and add the `pkg:transform-vega` label.

## License

[BSD-3-Clause](https://choosealicense.com/licenses/bsd-3-clause/)
