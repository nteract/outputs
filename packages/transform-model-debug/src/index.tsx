import * as React from "react";

interface Props {
  data: string;
  models: { [modelID: string]: object };
  modelID?: string;
  mediaType?: "application/x-nteract-model-debug+json";
}

const mediaType = "application/x-nteract-model-debug+json";

class ModelDebug extends React.Component<Partial<Props>> {
  static MIMETYPE = mediaType;

  static defaultProps = {
    mediaType
  };

  shouldComponentUpdate(): boolean {
    return true;
  }

  render() {
    const { models, data /*, modelID*/ } = this.props;
    // TODO: Provide model IDs on transient field
    // For now, if modelID is not provided (or model does not exist),
    // show all the models
    const model = models ? models.modelID || models : null;
    return (
      <React.Fragment>
        <h1>{JSON.stringify(data, null, 2)}</h1>
        <pre>{model ? JSON.stringify(model, null, 2) : null}</pre>
      </React.Fragment>
    );
  }
}

export default ModelDebug;
