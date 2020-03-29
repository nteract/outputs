import { objectToReactElement } from "../src/object-to-react";

describe("objectToReactElement", () => {
  it("throws an error for invalid tagNames", () => {
    const invocation = () => objectToReactElement({ tagName: 1 }, () => {});
    expect(invocation).toThrow("Invalid tagName on");
  });
  it("throws an error if no attributes are provided", () => {
    const invocation = () => objectToReactElement({ tagName: "h1" }, () => {});
    expect(invocation).toThrow(
      "Attributes must exist on a VDOM Object as an object"
    );
  });
  it("throws an error if style property is not an object", () => {
    const invocation = () =>
      objectToReactElement(
        { tagName: "h1", attributes: { style: 1 } },
        () => {}
      );
    expect(invocation).toThrow("Style attribute must be an object like");
  });
  it("removes dangerouslySetInnerHtml if it exists on VDOM element", () => {
    const element = objectToReactElement(
      { tagName: "h1", attributes: {} },
      () => {}
    );
    expect(element.props.dangerouslySetInnerHtml).toBeUndefined();
  });
  it("correctly maps event handlers on VDOM object", () => {
    const element = objectToReactElement(
      {
        tagName: "h1",
        attributes: {},
        eventHandlers: {
          blur: "targetName"
        }
      },
      () => {}
    );
    expect(element.props.blur).toBeDefined();
    expect(element.props.select).toBeUndefined();
  });
  it("throws an error if children is not a valid object", () => {
    const invocation = () =>
      objectToReactElement(
        { tagName: "h1", attributes: {}, children: 2 },
        () => {}
      );
    expect(invocation).toThrow("children of a vdom element must be a");
  });
});
