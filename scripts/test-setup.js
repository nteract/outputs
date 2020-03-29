const enzyme = require("enzyme");
const Adapter = require("enzyme-adapter-react-16");

enzyme.configure({ adapter: new Adapter() });

global.Range = function Range() {};

/**
 * Mock jQuery to allow jupyter-widgets tests to run.
 */
import $ from "jquery";
global.$ = global.jQuery = $;
require("jquery-ui");
require("jquery-ui/ui/widget");
require("jquery-ui/ui/widgets/mouse");

const createContextualFragment = html => {
  const div = document.createElement("div");
  div.innerHTML = html;
  // Element and DocumentFragment are technically incompatible
  return div.children[0];
};

Range.prototype.createContextualFragment = html =>
  createContextualFragment(html);

global.window.document.createRange = function createRange() {
  return {
    setEnd: () => {},
    setStart: () => {},
    // tslint:disable-next-line:object-literal-sort-keys
    getBoundingClientRect: () => ({ right: 0 }),
    getClientRects: () => [],
    createContextualFragment
  };
};

global.window.URL = {
  createObjectURL: () => {}
};
