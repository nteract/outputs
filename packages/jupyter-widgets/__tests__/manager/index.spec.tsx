import * as React from "react";

import Manager from "../../src/manager/index";
import { WidgetModel } from "@jupyter-widgets/base";

let manager: WidgetModel;
let modelById: (id: string) => Promise<WidgetModel>;

describe("Manager", () => {
  it("can be rendered", () => {
    expect(<Manager model_id="" 
                    contentRef="" id="" 
                    model={manager} 
                    modelById={modelById} 
                />).not.toBeNull();
  });
});
