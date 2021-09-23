import Immutable from "immutable";
import * as React from "react";
import { WidgetManager } from "../manager/widget-manager";

/**
 * Import the styles for jupyter-widgets. This overrides some of the
 * styles that jQuery applies to the widgets.
 */
import "@jupyter-widgets/base/css/index.css";
import "@jupyter-widgets/controls/css/labvariables.css";
import "@jupyter-widgets/controls/css/materialcolors.css";
import "@jupyter-widgets/controls/css/phosphor.css";
import "@jupyter-widgets/controls/css/widgets-base.css";
import "@jupyter-widgets/controls/css/widgets.css";

/**
 * Bring in the JavaScript and CSS for rendering the
 * widgets that require jQuery-UI.
 */
require("jquery-ui/themes/base/all.css");
require("jquery-ui/themes/base/core.css");
require("jquery-ui/themes/base/base.css");
require("jquery-ui/themes/base/theme.css");

interface Props {
  model: Immutable.Map<string, any>;
  manager?: WidgetManager;
  model_id: string;
  widgetContainerRef: React.RefObject<HTMLDivElement>;
}

export default class BackboneWrapper extends React.Component<Props> {
  created = false;

  constructor(props: Props) {
    super(props);
    this.createWidgetIfNotCreated = this.createWidgetIfNotCreated.bind(this);
  }

  async componentDidMount() {
    return this.createWidgetIfNotCreated();
  }
  async componentDidUpdate() {
    return this.createWidgetIfNotCreated();
  }

  async createWidgetIfNotCreated() {
    const { model, manager, widgetContainerRef, model_id } = this.props;
    if (!this.created && manager) {
      this.created = true;
      try {
        const widget = await manager.new_widget_from_state_and_id(
          model.toJS(),
          model_id
        );
        const view = await manager.create_view(
          widget,
          undefined // no options
        );
        if (widgetContainerRef.current) {
          manager.render_view(view, widgetContainerRef.current);
        }
      } catch (err) {
        throw err;
      }
    }
  }

  render() {
    return <div ref={this.props.widgetContainerRef} />;
  }
}
