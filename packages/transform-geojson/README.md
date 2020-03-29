# @nteract/transform-geojson

This package contains a React component that renders [GeoJSON data](http://geojson.org/) into interactive maps using [Leaflet](https://leafletjs.com/).

## Installation

```
$ yarn add @nteract/transform-geojson
```

```
$ npm install --save @nteract/transform-geojson
```

## Usage

The example below shows how we can use the transform to render two coordinates on a map with a pop-up.

```javascript
import GeoJSONTransform from "@nteract/transform-geojson";

export default () => {
  return (
    <GeoJSONTransform
      data={{
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {
              popupContent: "18th & California Light Rail Stop"
            },
            geometry: {
              type: "Point",
              coordinates: [-104.98999178409576, 39.74683938093904]
            }
          },
          {
            type: "Feature",
            properties: {
              popupContent: "20th & Welton Light Rail Stop"
            },
            geometry: {
              type: "Point",
              coordinates: [-104.98689115047453, 39.747924136466565]
            }
          }
        ]
      }}
      metadata={true}
    />
  );
};
```

## Documentation

We're working on adding more documentation for this component. Stay tuned by watching this repository!

## Support

If you experience an issue while using this package or have a feature request, please file an issue on the [issue board](https://github.com/nteract/nteract/issues/new/choose) and add the `pkg:transform-geojson` label.

## License

[BSD-3-Clause](https://choosealicense.com/licenses/bsd-3-clause/)
