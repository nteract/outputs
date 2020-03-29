import { embed as embedVega } from "@nteract/any-vega";

import { MEDIA_TYPES, VegaMediaType } from "./mime";

export interface VegaOptions {
  renderer: "canvas" | "svg";
}

/** Call the external library to do the embedding. */
export async function embed(
  anchor: HTMLElement,
  mediaType: VegaMediaType,
  spec: string,
  options: Partial<VegaOptions> = {},
): Promise<any> {
  const version = MEDIA_TYPES[mediaType];
  const defaults = {
    actions: false,
    mode: version.kind,
  };

  const embedThisVega = await embedVega(version as any);
  return embedThisVega(
    anchor,
    JSON.parse(spec),
    {...options, ...defaults},
  );
}
