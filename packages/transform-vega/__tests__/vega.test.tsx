import { mount } from "enzyme";
import * as React from "react";

import {
  Vega2, Vega3, Vega4, Vega5,
  VegaLite1, VegaLite2, VegaLite3, VegaLite4
} from "../src/";

const vlSpec = {
  description: "A scatterplot showing horsepower and miles per gallons.",
  data: {
    values: require("../data/cars.json"),
  },
  mark: "point",
  encoding: {
    x: { field: "Horsepower", type: "quantitative" },
    y: { field: "Miles_per_Gallon", type: "quantitative" },
    color: { field: "Origin", type: "nominal" },
    shape: { field: "Origin", type: "nominal" }
  }
};
const vgSpec = {
  "width": 200,
  "height": 200,
  "padding": 5,

  "data": [
    {
      "name": "source",
      "values": require("../data/cars.json"),
      "transform": [
        {
          "type": "filter",
          // tslint:disable-next-line:max-line-length
          "expr": "datum['Horsepower'] != null && datum['Miles_per_Gallon'] != null && datum['Acceleration'] != null"
        }
      ]
    }
  ],

  "scales": [
    {
      "name": "x",
      "type": "linear",
      "round": true,
      "nice": true,
      "zero": true,
      "domain": {"data": "source", "field": "Horsepower"},
      "range": "width"
    },
    {
      "name": "y",
      "type": "linear",
      "round": true,
      "nice": true,
      "zero": true,
      "domain": {"data": "source", "field": "Miles_per_Gallon"},
      "range": "height"
    },
    {
      "name": "size",
      "type": "linear",
      "round": true,
      "nice": false,
      "zero": true,
      "domain": {"data": "source", "field": "Acceleration"},
      "range": [4,361]
    }
  ],

  "axes": [
    {
      "scale": "x",
      "grid": true,
      "domain": false,
      "orient": "bottom",
      "tickCount": 5,
      "title": "Horsepower"
    },
    {
      "scale": "y",
      "grid": true,
      "domain": false,
      "orient": "left",
      "titlePadding": 5,
      "title": "Miles_per_Gallon"
    }
  ],

  "legends": [
    {
      "size": "size",
      "title": "Acceleration",
      "format": "s",
      "encode": {
        "symbols": {
          "update": {
            "strokeWidth": {"value": 2},
            "opacity": {"value": 0.5},
            "stroke": {"value": "#4682b4"},
            "shape": {"value": "circle"}
          }
        }
      }
    }
  ],

  "marks": [
    {
      "name": "marks",
      "type": "symbol",
      "from": {"data": "source"},
      "encode": {
        "update": {
          "x": {"scale": "x", "field": "Horsepower"},
          "y": {"scale": "y", "field": "Miles_per_Gallon"},
          "size": {"scale": "size", "field": "Acceleration"},
          "shape": {"value": "circle"},
          "strokeWidth": {"value": 2},
          "opacity": {"value": 0.5},
          "stroke": {"value": "#4682b4"},
          "fill": {"value": "transparent"}
        }
      }
    }
  ]
};

const makeTestBody = (component, mimetype, spec) => () => {
  it("has the correct media type", () => {
    expect(component.MIMETYPE).toBe(mimetype);
  });

  it("renders the spec as SVG properly", done => {
    const wrapper = mount(component({
      data: JSON.stringify(spec),
      options: {renderer: "svg"},
      onError: error => { throw error },
      onResult: () => {
        expect(wrapper.render()).toMatchSnapshot();
        wrapper.unmount();   // must not throw
        done();
      },
    }));
  });
};

describe.skip("VegaLite1", makeTestBody(
  VegaLite1, "application/vnd.vegalite.v1+json", vlSpec
));

describe("VegaLite2", makeTestBody(
  VegaLite2, "application/vnd.vegalite.v2+json", vlSpec,
));

describe("VegaLite3", makeTestBody(
  VegaLite3, "application/vnd.vegalite.v3+json", vlSpec,
));

describe("VegaLite4", makeTestBody(
  VegaLite4, "application/vnd.vegalite.v4+json", vlSpec,
));

describe.skip("Vega2", makeTestBody(
  Vega2, "application/vnd.vega.v2+json", vgSpec
));

describe("Vega3", makeTestBody(
  Vega3, "application/vnd.vega.v3+json", vgSpec,
));

describe("Vega4", makeTestBody(
  Vega4, "application/vnd.vega.v4+json", vgSpec,
));

describe("Vega5", makeTestBody(
  Vega5, "application/vnd.vega.v5+json", vgSpec,
));
