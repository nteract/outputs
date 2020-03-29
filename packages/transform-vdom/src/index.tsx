import cloneDeep from "lodash.clonedeep";
import * as React from "react";

import {
  Attributes,
  objectToReactElement,
  SerializedEvent,
  VDOMEl
} from "./object-to-react";

interface Props {
  mediaType: "application/vdom.v1+json";
  data: VDOMEl;
  onVDOMEvent: (targetName: string, event: SerializedEvent<any>) => void;
}

// Provide object-to-react as an available helper on the library
export { objectToReactElement, VDOMEl, Attributes, SerializedEvent };

const mediaType = "application/vdom.v1+json";

export default class VDOM extends React.PureComponent<Partial<Props>> {
  static MIMETYPE = mediaType;

  static defaultProps = {
    mediaType,
    onVDOMEvent: () => {
      console.log(
        "This app doesn't support vdom events ☹️ See @nteract/transform-vdom for more info: https://github.com/nteract/nteract/tree/master/packages/transform-vdom"
      );
    }
  };

  render(): React.ReactElement<any> {
    try {
      if (this.props.data && this.props.onVDOMEvent) {
        // objectToReactElement is mutatitve so we'll clone our object
        const obj = cloneDeep(this.props.data);
        return objectToReactElement(obj, this.props.onVDOMEvent);
      } else {
        throw new Error("No VDOM data provided.");
      }
    } catch (err) {
      return (
        <React.Fragment>
          <pre
            style={{
              backgroundColor: "ghostwhite",
              color: "black",
              fontWeight: 600,
              display: "block",
              padding: "10px",
              marginBottom: "20px"
            }}
          >
            There was an error rendering VDOM data from the kernel or notebook
          </pre>
          <code>{err.toString()}</code>
        </React.Fragment>
      );
    }
  }
}
