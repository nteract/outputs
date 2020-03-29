import { KernelMessage } from "@jupyterlab/services";
import * as base from "@jupyter-widgets/base";
import * as controls from "@jupyter-widgets/controls";
import * as pWidget from "@phosphor/widgets";
import {
  DOMWidgetView,
  WidgetModel,
  DOMWidgetModel
} from "@jupyter-widgets/base";
import { WidgetComm } from "./widget-comms";
import { RecordOf } from "immutable";
import {
  KernelNotStartedProps,
  LocalKernelProps,
  RemoteKernelProps
} from "@nteract/core";
import { JupyterMessage } from "@nteract/messaging";
import { ManagerActions } from "../manager/index";

interface IDomWidgetModel extends DOMWidgetModel {
  _model_name: string;
  _model_module: string;
  _module_version: string;
  _view_name: string;
  _view_module: string;
  _view_module_version: string;
}

/**
 * The WidgetManager extends the ManagerBase class and is required
 * by the ipywidgets implementation for rendering all models. This
 * WidgetManager contains some overrides to get it to play nice
 * with our RxJS-based kernel communication.
 */
export class WidgetManager extends base.ManagerBase<DOMWidgetView> {
  stateModelById: (id: string) => any;
  kernel:
    | RecordOf<KernelNotStartedProps>
    | RecordOf<LocalKernelProps>
    | RecordOf<RemoteKernelProps>
    | null;
  actions: ManagerActions["actions"];
  widgetsBeingCreated: { [model_id: string]: Promise<WidgetModel> };

  constructor(
    kernel: any,
    stateModelById: (id: string) => any,
    actions: ManagerActions["actions"]
  ) {
    super();
    this.kernel = kernel;
    this.stateModelById = stateModelById;
    this.actions = actions;
    this.widgetsBeingCreated = {};
  }

  update(
    kernel: any,
    stateModelById: (id: string) => any,
    actions: ManagerActions["actions"]
  ) {
    this.kernel = kernel;
    this.stateModelById = stateModelById;
    this.actions = actions;
  }

  /**
   * Load a class and return a promise to the loaded object.
   */
  loadClass(className: string, moduleName: string, moduleVersion: string): any {
    return new Promise(function(resolve, reject) {
      if (moduleName === "@jupyter-widgets/controls") {
        resolve(controls);
      } else if (moduleName === "@jupyter-widgets/base") {
        resolve(base);
      } else {
        return Promise.reject(
          `Module ${moduleName}@${moduleVersion} not found`
        );
      }
    }).then(function(module: any) {
      if (module[className]) {
        return module[className];
      } else {
        return Promise.reject(
          `Class ${className} not found in module ${moduleName}@${moduleVersion}`
        );
      }
    });
  }

  /**
   * Get a promise for a model by model id.
   *
   * #### Notes
   * If a model is not found, this will lookup the model in nteracts
   * redux store using the model_comm_lookup funciton and create it
   */
  get_model(model_id: string): Promise<WidgetModel> | undefined {
    let model = super.get_model(model_id);
    if (model === undefined) {
      return this.stateModelById(model_id).then((model: WidgetModel) => {
        let model_state = model.get("state").toJS();
        return this.new_widget_from_state_and_id(model_state, model_id);
      });
    } else {
      return model;
    }
  }

  /**
   * Shortcut to new_widget (creates the modelInfo from the state)
   * @param state
   * @param model_id
   */
  async new_widget_from_state_and_id(state: any, model_id: string) {
    let modelInfo = {
      model_id: model_id,
      model_name: state._model_name,
      model_module: state._model_module,
      model_module_version: state._module_version,
      view_name: state._view_name,
      view_module: state._view_module,
      view_module_version: state._view_module_version
    };
    return this.new_widget(modelInfo, state);
  }

  /**
   * Create a comm and new widget model.
   * @param  options - same options as new_model but comm is not
   *                          required and additional options are available.
   * @param  serialized_state - serialized model attributes.
   */
  new_widget(options: any, serialized_state: any = {}): Promise<WidgetModel> {
    const model_id = options.model_id;
    //if this widget is already created
    const existing_widget = super.get_model(model_id);
    if (existing_widget) {
      return existing_widget;
    }
    //if this widget is in the process of being created
    else if (this.widgetsBeingCreated[model_id]) {
      return this.widgetsBeingCreated[model_id];
    }
    //otherwise create a new widget
    else {
      let widget = super.new_widget(options, serialized_state);
      this.widgetsBeingCreated[model_id] = widget;
      return widget.then((new_widget: WidgetModel) => {
        delete this.widgetsBeingCreated[new_widget.model_id];
        return Promise.resolve(new_widget);
      });
    }
  }

  /**
   * Do not use this method. Use `render_view` instead for displaying the widget.
   *
   * This method is here because it is required to be implemented by the ManagerBase,
   * so even though it is not used, do not delete it.
   * @param msg
   * @param view
   * @param options
   */
  display_view(
    msg: KernelMessage.IMessage,
    view: base.DOMWidgetView,
    options: any
  ): Promise<base.DOMWidgetView> {
    throw Error("display_view not implemented. Use render_view instead.");
  }

  /**
   * The ManagerBase type definition for the callbacks method expects
   * the message types to be as defined by the IMessage interface from
   * @jupyterlab/services. It is typed as any here so that we can use
   * our JupyterMessage types that are emitted from our kernel.channels
   * pipeline.
   */
  callbacks(): any {
    return {
      iopub: {
        output: (reply: JupyterMessage) =>
          this.actions.appendOutput({
            ...reply.content,
            output_type: reply.header.msg_type
          }),
        clear_output: (reply: JupyterMessage) => this.actions.clearOutput(),
        status: (reply: JupyterMessage) =>
          this.actions.updateCellStatus(reply.content.execution_state)
      },
      input: (reply: JupyterMessage) =>
        this.actions.promptInputRequest(
          reply.content.prompt,
          reply.content.password
        )
    };
  }

  /**
   * Render the given view to a target element
   * @param view View to be rendered
   * @param el Target element that the view will be rendered within
   */
  render_view(view: base.DOMWidgetView, el: HTMLElement): void {
    pWidget.Widget.attach(view.pWidget, el);
  }

  /**
   * This is not needed in our implementation. Instead, our stateModelById function
   * sends an "update_state" message to the kernel if the model state cannot be found in
   * the redux store
   */
  _get_comm_info(): Promise<{}> {
    throw new Error("_get_comm_info is not implemented!");
  }

  /**
   * Create a comm which can be used for communication for a widget.
   *
   * @param comm_target_name Comm target name
   * @param model_id The comm id
   * @param data The initial data for the comm
   * @param metadata The metadata in the open message
   */
  _create_comm(
    comm_target_name: string,
    model_id: string,
    data?: any,
    metadata?: any,
    buffers?: ArrayBuffer[] | ArrayBufferView[]
  ) {
    // Despite the doc string in iPyWidgets ManagerBase, we do not open a comm
    // regardless of if data or metadata is passed in because a Manager is only
    // instantiated once we already have recieved model information. This means that
    // a comm is already open in the Kernel.
    // If we ever find that we do need to open a comm, use the WidgetComm you create
    // to send a comm_open message. To figure out the target module, you can call
    // super.get_model(model_id) and read it from the state there.
    if (this.kernel) {
      return Promise.resolve(
        new WidgetComm(
          model_id,
          this.comm_target_name,
          "<target module>", // This is only used in comm opens, which is currently never used
          this.kernel
        )
      );
    } else {
      return Promise.reject("Kernel is null or undefined");
    }
  }
}
