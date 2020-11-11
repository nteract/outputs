import { IntSliderView } from "@jupyter-widgets/controls";
import { Map } from "immutable";

import { ManagerActions } from "../../src/manager/index";
import { WidgetManager } from "../../src/manager/widget-manager";
import * as customWidgetLoader from "../../src/manager/widget-loader";

// A mock valid module representing a custom widget
const mockFooModule = {
  "foo" : "bar"
};
// Mock implementation of the core require API
const mockRequireJS = jest.fn((modules, ready, errCB) => ready(mockFooModule));
(window as any).requirejs = mockRequireJS;
(window as any).requirejs.config  = jest.fn();

// Manager actions passed as the third arg when instantiating the WidgetManager class
const mockManagerActions: ManagerActions["actions"] = {
  appendOutput: jest.fn(),
  clearOutput: jest.fn(),
  updateCellStatus: jest.fn(),
  promptInputRequest: jest.fn()
};

// Default modelById stub
const mockModelById = (id: string) => undefined;

describe("WidgetManager", () => {
  describe("loadClass", () => {
    beforeAll(() => {
      jest.clearAllMocks();
    });
    afterEach(() => {
      jest.clearAllMocks();
    });

    it("returns a class if it exists", () => {
      const manager = new WidgetManager(null, mockModelById, mockManagerActions);
      const view = manager.loadClass(
        "IntSliderView",
        "@jupyter-widgets/controls",
        "1.5.0"
      );
      expect(view).not.toBe(null);
    });

    it("Returns a valid module class successfully from CDN for custom widgets", () => {
      const manager = new WidgetManager(null, mockModelById, mockManagerActions);
      const requireLoaderSpy = jest.spyOn(customWidgetLoader, "requireLoader");

      return manager.loadClass(
        "foo",
        "fooModule",
        "1.1.0"
      ).then(view => {
        expect(requireLoaderSpy).toHaveBeenCalledTimes(1);
        // Get the second arg to Monaco.editor.create call
        const mockLoaderArgs = requireLoaderSpy.mock.calls[0];
        expect(mockLoaderArgs).not.toBe(null);
        expect(mockLoaderArgs.length).toBe(4);
        expect(mockLoaderArgs[0]).toBe("fooModule");
        expect(mockLoaderArgs[1]).toBe("1.1.0");
        expect(view).not.toBe(null);
        expect(view).toBe(mockFooModule["foo"]);
      });
    });

    it("Returns an error if the class does not exist on the module", () => {
      const manager = new WidgetManager(null, mockModelById, mockManagerActions);
      const requireLoaderSpy = jest.spyOn(customWidgetLoader, "requireLoader");

      return manager.loadClass(
        "INVALID_CLASS",
        "fooModule",
        "1.1.0"
      ).catch(error => {
        expect(requireLoaderSpy).toHaveBeenCalledTimes(1);
        expect(error).toBe("Class INVALID_CLASS not found in module fooModule@1.1.0");
      });
    });
  });

  describe("create_view", () => {
    it("returns a widget mounted on the provided element", async () => {
      const manager = new WidgetManager(null, mockModelById, mockManagerActions);
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
      const manager = new WidgetManager(null, modelById, mockManagerActions);
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
    const manager = new WidgetManager(null, mockModelById, mockManagerActions);
    expect(manager.kernel).toBeNull();
    const newKernel = { channels: { next: jest.fn() } };
    manager.update(newKernel, mockModelById, mockManagerActions);
    expect(manager.kernel).toBe(newKernel);
  });
});
