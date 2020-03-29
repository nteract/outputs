import { Error } from "@nteract/presentational-components";
import * as React from "react";
import { embed, VegaOptions } from "./external";
import { VegaMediaType } from "./mime";

/** Props needed for embedding a certain Vega(-Lite) media type. */
export interface VegaEmbedProps<T extends VegaMediaType> {
  spec: string;
  mediaType: T;
  options?: Partial<VegaOptions>,
  resultHandler?: (result: any) => void;
  errorHandler?: (error: Error) => void;
}

/** React component embedding a certain Vega(-Lite) media type. */
export class VegaEmbed<T extends VegaMediaType>
  extends React.Component<VegaEmbedProps<T>> {

  private readonly anchorRef: React.RefObject<HTMLDivElement>;
  private embedResult?: any;
  private embedError?: Error;

  constructor(props: VegaEmbedProps<T>) {
    super(props);
    this.anchorRef = React.createRef<HTMLDivElement>();
  }

  render(): JSX.Element {
    return (
      <div>
        <Error error={this.embedError}/>
        <div ref={this.anchorRef}/>
      </div>
    );
  }

  async callEmbedder(): Promise<void> {
    if (this.anchorRef.current === null) { return; }

    try {
      this.embedResult = await embed(
        this.anchorRef.current,
        this.props.mediaType,
        this.props.spec,
        this.props.options,
      );

      this.props.resultHandler?.(this.embedResult);
    }
    catch (error) {
      this.props.errorHandler?.(error);
      this.embedError = error;
      this.forceUpdate();
    }
  }

  shouldComponentUpdate(nextProps: VegaEmbedProps<T>): boolean {
    if (this.props.spec !== nextProps.spec) {
      this.embedError = undefined;
      return true;
    }
    else {
      return false;
    }
  }

  componentDidMount(): void {
    this.callEmbedder().then();
  }

  componentDidUpdate(): void {
    if (!this.embedError) {
      this.callEmbedder().then();
    }
  }

  componentWillUnmount(): void {
    if (this.embedResult) {
      if (this.embedResult.finalize) {
        this.embedResult.finalize();
      }
      else if (this.embedResult.view?.finalize) {
        this.embedResult.view.finalize();
      }

      this.embedResult = undefined;
    }
  }
}
