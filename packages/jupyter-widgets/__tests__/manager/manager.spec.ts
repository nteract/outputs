import { IntSliderView } from "@jupyter-widgets/controls";
import { Map } from "immutable";

import { WidgetManager } from "../../src/manager/widget-manager";

describe("WidgetManager", () => {
  describe("loadClass", () => {
    it("returns a class if it exists", () => {
      const modelById = (id: string) => undefined;
      const manager = new WidgetManager(null, modelById);
      const view = manager.loadClass(
        "IntSliderView",
        "@jupyter-widgets/controls",
        "1.5.0"
      );
      expect(view).not.toBe(null);
    });
  });
  describe("create_view", () => {
    it("returns a widget mounted on the provided element", async () => {
      const modelById = (id: string) => undefined;
      const manager = new WidgetManager(null, modelById);
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
      const widget = await manager.new_widget_from_state_and_id(
        model,
        "test_model_id"
      );
      const view = await manager.create_view(widget, {});
      expect(view).not.toBeNull();
      expect(view instanceof IntSliderView).toBe(true);
      expect(view.model.attributes.value).toBe(7);
    });
  });
  describe("layout and style", () => {
    it("returns a widget view with instantiated style and layout view", async () => {
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
        value: 7,
        style: "IPY_MODEL_layout_id",
        layout: "IPY_MODEL_style_id"
      };
      const layoutModel = {
        _model_module: "@jupyter-widgets/base",
        _model_module_version: "1.2.0",
        _model_name: "LayoutModel",
        _view_count: null,
        _view_module: "@jupyter-widgets/base",
        _view_module_version: "1.2.0",
        _view_name: "LayoutView"
      };
      const styleModel = {
        _dom_classes: [],
        _model_module: "@jupyter-widgets/controls",
        _model_module_version: "1.5.0",
        _model_name: "SliderStyleModel",
        _view_count: null,
        _view_module: "@jupyter-widgets/base",
        _view_module_version: "1.2.0",
        _view_name: "StyleView"
      };
      const modelById = (id: string) => {
        const model = id === "layout_id" ? layoutModel : styleModel;
        return Promise.resolve(Map({ state: Map(model) }));
      };
      const manager = new WidgetManager(null, modelById);
      const widget = await manager.new_widget_from_state_and_id(
        model,
        "test_model_id"
      );
      const view = await manager.create_view(widget, {});
      const el = document.createElement("div");
      document.body.appendChild(el);
      manager.render_view(view, el);
      // render_view sends out an event that the view waits for before it it sets the style and layout promise.
      // this means we need to wait for the callbacks to finish before we check their value
      setTimeout(async () => {
        const styleView = await view.stylePromise;
        const layoutView = await view.layoutPromise;
        expect(styleView).toBeTruthy();
        expect(layoutView).toBeTruthy();
      }, 1000);
    });
  });
  it("can update class properties via method", () => {
    const modelById = (id: string) => undefined;
    const manager = new WidgetManager(null, modelById);
    expect(manager.kernel).toBeNull();
    const newKernel = { channels: { next: jest.fn() } };
    manager.update(newKernel, modelById, {});
    expect(manager.kernel).toBe(newKernel);
  });
});
