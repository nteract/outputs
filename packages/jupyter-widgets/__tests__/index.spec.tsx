import * as React from "react";

import WidgetDisplay from "../src/index";

describe("WidgetDisplay", () => {
  it("can be rendered", () => {
    const data = {
      model_id: "someModeId",
      version_major: 2,
      version_minor: 0
    };
    const model = {
      _dom_classes: [],
      _model_module: "@jupyter-widgets/controls",
      _model_module_version: "1.5.0",
      _model_name: "IntSliderModel",
      _view_count: null,
      _view_module: "@jupyter-widgets/controls",
      _view_module_version: "1.5.0",
      _view_name: "IntSliderView",
      continuous_update: false,
      description: "Test:",
      description_tooltip: null,
      disabled: false,
      max: 10,
      min: 0,
      orientation: "horizontal",
      readout: true,
      readout_format: "d",
      step: 1,
      value: 7
    };
    expect(<WidgetDisplay data={data} model={model} />).toMatchSnapshot();
  });
});
