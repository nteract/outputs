import { ImmutableStreamOutput } from "@nteract/commutable";
import Ansi from "ansi-to-react";
import * as React from "react";

interface Props {
  output_type: "stream";
  output: ImmutableStreamOutput;
  linkify?: boolean;
  useClasses?: boolean;
}

export class StreamText extends React.PureComponent<Props> {
  static defaultProps = {
    output: null,
    output_type: "stream"
  };

  render() {
    const { output, linkify, useClasses } = this.props;
    if (!output) {
      return null;
    }
    const { text, name } = output;

    return (
      <Ansi linkify={linkify ?? true} className={`nteract-display-area-${name}`} useClasses={useClasses}>
        {text}
      </Ansi>
    );
  }
}

export default StreamText;