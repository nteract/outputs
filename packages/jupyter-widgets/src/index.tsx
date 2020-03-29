import * as React from "react";
import { connect } from "react-redux";
import {
  selectors,
  AppState,
  ContentRef,
  KernelNotStartedProps,
  LocalKernelProps,
  RemoteKernelProps
} from "@nteract/core";
import { fromJS, RecordOf } from "immutable";
import Manager from "./manager";
import { WidgetModel } from "@jupyter-widgets/base";
import { CellId } from "@nteract/commutable";
import { request_state } from "./manager/widget-comms";

interface JupyterWidgetData {
  model_id: string;
  version_major: number;
  version_minor: number;
}

interface Props {
  data: JupyterWidgetData;
  modelById: (model_id: string) => Promise<WidgetModel>;
  kernel?:
    | RecordOf<KernelNotStartedProps>
    | RecordOf<LocalKernelProps>
    | RecordOf<RemoteKernelProps>
    | null;
  id: CellId;
  contentRef: ContentRef;
}

interface State {
  model?: WidgetModel;
}

/**
 * The WidgetDisplay takes a model_id, which is returned by the
 * display_data payload that is returned from the execution of a
 * cell containing an ipywidget. This model_id is used to retrieve
 * the initial model for the widget from the comms state in the
 * core state model.
 */
export class WidgetDisplay extends React.Component<Props, State> {
  static MIMETYPE = "application/vnd.jupyter.widget-view+json";

  constructor(props: Props) {
    super(props);
    this.state = { model: undefined };
  }

  async componentDidMount() {
    const {
      modelById,
      data: { model_id }
    } = this.props;

    const model = await modelById(model_id);
    this.setState({ model });
  }

  render() {
    const { model } = this.state;
    if (model) {
      return (
        <Manager
          model={model}
          model_id={this.props.data.model_id}
          id={this.props.id}
          contentRef={this.props.contentRef}
          modelById={this.props.modelById}
          kernel={this.props.kernel}
        />
      );
    } else {
      return null;
    }
  }
}

const mapStateToProps = (state: AppState, props: Props) => {
  let currentKernel = selectors.currentKernel(state);
  return {
    modelById: async (model_id: string) => {
      let model = selectors.modelById(state, { commId: model_id });
      //if we can't find the model, request the state from the kernel
      if (!model && currentKernel) {
        let request_state_response = await request_state(
          currentKernel,
          model_id
        );
        model = fromJS(request_state_response.content.data);
      }
      return model;
    },
    kernel: currentKernel
  };
};

export default connect(mapStateToProps, null)(WidgetDisplay);
