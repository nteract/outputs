/** Single MIME string. */
export type VegaMediaType =
  | "application/vnd.vega.v2+json"
  | "application/vnd.vega.v3+json"
  | "application/vnd.vega.v4+json"
  | "application/vnd.vega.v5+json"
  | "application/vnd.vegalite.v1+json"
  | "application/vnd.vegalite.v2+json"
  | "application/vnd.vegalite.v3+json"
  | "application/vnd.vegalite.v4+json"
  ;

/** Information about a particular Vega or Vega Lite version. */
export interface VegaMediaTypeInfo<T extends VegaMediaType> {
  kind: "vega" | "vega-lite",
  version: string,
  vegaLevel: 2 | 3 | 4 | 5,
  mediaType: T,
  schemaPrefix: string,
}

/** Information about all known Vega or Vega Lite versions. */
export type VegaMediaTypes = { [K in VegaMediaType]: VegaMediaTypeInfo<K> }

/** All the information. All of it. On Vega (Lite) media types, at least. */
export const MEDIA_TYPES: VegaMediaTypes = {
  "application/vnd.vega.v2+json": {
    kind: "vega",
    version: "2",
    vegaLevel: 2,
    mediaType: "application/vnd.vega.v2+json",
    schemaPrefix: "https://vega.github.io/schema/vega/v2",
  },
  "application/vnd.vega.v3+json": {
    kind: "vega",
    version: "3",
    vegaLevel: 3,
    mediaType: "application/vnd.vega.v3+json",
    schemaPrefix: "https://vega.github.io/schema/vega/v3",
  },
  "application/vnd.vega.v4+json": {
    kind: "vega",
    version: "4",
    vegaLevel: 4,
    mediaType: "application/vnd.vega.v4+json",
    schemaPrefix: "https://vega.github.io/schema/vega/v4",
  },
  "application/vnd.vega.v5+json": {
    kind: "vega",
    version: "5",
    vegaLevel: 5,
    mediaType: "application/vnd.vega.v5+json",
    schemaPrefix: "https://vega.github.io/schema/vega/v5",
  },
  "application/vnd.vegalite.v1+json": {
    kind: "vega-lite",
    version: "1",
    vegaLevel: 2,
    mediaType: "application/vnd.vegalite.v1+json",
    schemaPrefix: "https://vega.github.io/schema/vega-lite/v1",
  },
  "application/vnd.vegalite.v2+json": {
    kind: "vega-lite",
    version: "2",
    vegaLevel: 3,
    mediaType: "application/vnd.vegalite.v2+json",
    schemaPrefix: "https://vega.github.io/schema/vega-lite/v2",
  },
  "application/vnd.vegalite.v3+json": {
    kind: "vega-lite",
    version: "3",
    vegaLevel: 5,
    mediaType: "application/vnd.vegalite.v3+json",
    schemaPrefix: "https://vega.github.io/schema/vega-lite/v3",
  },
  "application/vnd.vegalite.v4+json": {
    kind: "vega-lite",
    version: "4",
    vegaLevel: 5,
    mediaType: "application/vnd.vegalite.v4+json",
    schemaPrefix: "https://vega.github.io/schema/vega-lite/v4",
  },
};
