# @nteract/transform-plotly

This package contains a React component for rendering visualizations using Plotly.

## Installation

```
$ yarn add @nteract/transform-plotly
```

```
$ npm install --save @nteract/transform-plotly
```

## Usage

The example below shows how we can use the PlotlyTransform to render a scatterplot.

```javascript
import PlotlyTransform from "@nteract/transform-plotly";

export default () => {
  return (
    <PlotlyTransform
      data={`{
  data: [
    { x: [1999, 2000, 2001, 2002], y: [10, 15, 13, 17], type: "scatter" },
    { x: [1999, 2000, 2001, 2002], y: [16, 5, 11, 9], type: "scatter" }
  ],
  layout: {
    title: "Super Stuff",
    xaxis: { title: "Year", showgrid: false, zeroline: false },
    yaxis: { title: "Percent", showline: false },
    height: "100px"
  }
}`}
    />
  );
};
```

## Documentation

We're working on adding more documentation for this component. Stay tuned by watching this repository!

## Support

If you experience an issue while using this package or have a feature request, please file an issue on the [issue board](https://github.com/nteract/nteract/issues/new/choose) and add the `pkg:transform-plotly` label.

## License

[BSD-3-Clause](https://choosealicense.com/licenses/bsd-3-clause/)
