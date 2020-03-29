import { mount } from "enzyme";
import * as React from "react";

import { WidgetManager } from "../../src/manager/widget-manager";
import BackboneWrapper from "../../src/renderer/backbone-wrapper";

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
  layout: "IPY_MODEL_db277618a5c443009a6aa5b07f6b1812",
  max: 10,
  min: 0,
  orientation: "horizontal",
  readout: true,
  readout_format: "d",
  step: 1,
  style: "IPY_MODEL_2e810dab21354e9381f53582e51e9a79",
  value: 7
};

describe("BackboneWrapper", () => {
  it("can render an IntSlider", () => {
    const modelById = (id: string) => undefined;
    expect(
      <BackboneWrapper
        model={model}
        model_id="f5b390fef51d5aa538984bd8"
        manager={new WidgetManager(null, modelById)}
        widgetContainerRef={React.createRef()}
      />
    ).not.toBeNull();
  });
  it("calls createWidgetIfNotCreated on mount and update", () => {
    const createWidgetIfNotCreated = jest.spyOn(
      BackboneWrapper.prototype,
      "createWidgetIfNotCreated"
    );
    const modelById = (id: string) => undefined;
    const component = mount(
      <BackboneWrapper
        model={model}
        model_id="f5b390fef51d5aa538984bd8"
        manager={new WidgetManager(null, modelById)}
        widgetContainerRef={React.createRef()}
      />
    );
    component.setProps({ model_id: "new_id" });
    expect(createWidgetIfNotCreated).toBeCalledTimes(2);
  });
});
