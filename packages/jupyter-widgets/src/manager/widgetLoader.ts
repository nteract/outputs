import * as base from "@jupyter-widgets/base";
import * as controls from "@jupyter-widgets/controls";

let cdn = 'https://unpkg.com/';

/**
 * Constructs a well formed module URL for requireJS 
 * mapping the modulename and version from the base CDN URL
 * @param moduleName Name of the module corresponding to the widget package
 * @param moduleVersion Module version returned from kernel
 */
function moduleNameToCDNUrl(moduleName: string, moduleVersion: string): string {
  let packageName = moduleName;
  let fileName = 'index.js'; // default filename
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
  let moduleNameString = moduleName;
  if(moduleVersion){
    moduleNameString = `${moduleName}@${moduleVersion}`;
  }
  return `${cdn}${moduleNameString}/dist/${fileName}`;
}

/**
 * Initialize dependencies that need to be preconfigured for requireJS module loading
 * Here, we define the jupyter-base, controls package that most 3rd party widgets depend on
 * We also override the cdn end point (if applicable)
 */
export function initRequireDeps(){
  // Export the following for `requirejs`.
  // tslint:disable-next-line: no-any no-function-expression no-empty
  const define = (window as any).define || function () {};
  define('@jupyter-widgets/controls', () => controls);
  define('@jupyter-widgets/base', () => base);

  // find the data-cdn for any script tag, assuming it is only used for embed-amd.js
  const scripts = document.getElementsByTagName('script');
  Array.prototype.forEach.call(scripts, (script: HTMLScriptElement) => {
    cdn = script.getAttribute('data-jupyter-widgets-cdn') || cdn;
  });
}

/**
 * Load an amd module locally and fall back to specified CDN if unavailable.
 *
 * @param moduleName The name of the module to load..
 * @param moduleVersion The semver range for the module, if loaded from a CDN.
 * @param succssCB Callback when the module is loaded successfully by requireJS
 * @param errorCB Called to hand off any errors encountered during modul eloading
 *
 * By default, the CDN service used is unpkg.com. However, this default can be
 * overriden by specifying another URL via the HTML attribute
 * "data-jupyter-widgets-cdn" on a script tag of the page.
 *
 * The semver range is only used with the CDN.
 */
export function requireLoader(moduleName: string, moduleVersion: string, successCB: (value?: unknown) => void, errorCB: (reason ?: any) => void): any {
  const require = (window as any).requirejs;
  if (require === undefined) {
    console.error('Requirejs is needed, please ensure it is loaded on the page.');
  }
  const conf: { paths: { [key: string]: string } } = { paths: {} };
  const moduleCDN = moduleNameToCDNUrl(moduleName, moduleVersion);
  console.log("module CDN Url "+moduleCDN);
  conf.paths[moduleName] = moduleCDN;
  require.config(conf);
  return require([`${moduleCDN}`], successCB, errorCB);
}
