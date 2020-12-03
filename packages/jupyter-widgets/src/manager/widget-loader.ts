/**
 * Several functions in this file are based off the html-manager in jupyter-widgets project -
 * https://github.com/jupyter-widgets/ipywidgets/blob/master/packages/html-manager/src/libembed-amd.ts
 */

import * as base from "@jupyter-widgets/base";
import * as controls from "@jupyter-widgets/controls";

const requireJSMissingErrorMessage = "Requirejs is needed, please ensure it is loaded on the page. Docs - https://requirejs.org/docs/api.html";
let cdn = "https://unpkg.com";

/**
 * Constructs a well formed module URL for requireJS 
 * mapping the modulename and version from the base CDN URL
 * @param moduleName Name of the module corresponding to the widget package
 * @param moduleVersion Module version returned from kernel
 */
function moduleNameToCDNUrl(moduleName: string, moduleVersion: string): string {
  let packageName = moduleName;
  let fileName = "index.js"; // default filename
  // if a '/' is present, like 'foo/bar', packageName is changed to 'foo', and path to 'bar'
  // We first find the first '/'
  let index = moduleName.indexOf('/');
  if (index !== -1 && moduleName[0] === '@') {
    // if we have a namespace, it's a different story
    // @foo/bar/baz should translate to @foo/bar and baz
    // so we find the 2nd '/'
    index = moduleName.indexOf('/', index + 1);
  }
  if (index !== -1) {
    fileName = moduleName.substr(index + 1);
    packageName = moduleName.substr(0, index);
  }
  const moduleNameString = moduleVersion ? `${packageName}@${moduleVersion}` : packageName;
  return `${cdn}/${moduleNameString}/dist/${fileName}`;
}

/**
 * Load a package using requirejs and return a promise
 *
 * @param pkg Package name or names to load
 */
function requirePromise(pkg: string | string[]): Promise<any> {
  return new Promise((resolve, reject) => {
    const require = (window as any).requirejs;
    if (require === undefined) {
      reject(requireJSMissingErrorMessage);
    }
    else {
      // tslint:disable-next-line: non-literal-require
      require(pkg, resolve, reject);
    }
  });
};

/**
 * Initialize dependencies that need to be preconfigured for requireJS module loading
 * Here, we define the jupyter-base, controls package that most 3rd party widgets depend on
 */
export function initRequireDeps(){
  // Export the following for `requirejs`.
  // tslint:disable-next-line: no-any no-function-expression no-empty
  const define = (window as any).define || function () {};
  define("@jupyter-widgets/controls", () => controls);
  define("@jupyter-widgets/base", () => base);
}

/**
 * Overrides the default CDN base URL by querying the DOM for script tags
 * By default, the CDN service used is unpkg.com. However, this default can be
 * overriden by specifying another URL via the HTML attribute
 * "data-jupyter-widgets-cdn" on a script tag of the page.
 */
export function overrideCDNBaseURL(){
  // find the data-cdn for any script tag
  const scripts = document.getElementsByTagName("script");
  Array.prototype.forEach.call(scripts, (script: HTMLScriptElement) => {
    cdn = script.getAttribute("data-jupyter-widgets-cdn") || cdn;
  });
  // Remove Single/consecutive trailing slashes from the URL to sanitize it
  cdn = cdn.replace(/\/+$/, "");
}

/**
 * Load an amd module from a specified CDN
 *
 * @param moduleName The name of the module to load.
 * @param moduleVersion The semver range for the module, if loaded from a CDN.
 *
 * By default, the CDN service used is unpkg.com. However, this default can be
 * overriden by specifying another URL via the HTML attribute
 * "data-jupyter-widgets-cdn" on a script tag of the page.
 *
 * The semver range is only used with the CDN.
 */
export function requireLoader(moduleName: string, moduleVersion: string): Promise<any> {
  const require = (window as any).requirejs;
  if (require === undefined) {
    return Promise.reject(new Error(requireJSMissingErrorMessage));
  }
  else {
    const conf: { paths: { [key: string]: string } } = { paths: {} };
    const moduleCDN = moduleNameToCDNUrl(moduleName, moduleVersion);
    conf.paths[moduleName] = moduleCDN;
    require.config(conf);
    return requirePromise([moduleCDN]);
  }
}
