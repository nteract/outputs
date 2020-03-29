import { serializeEvent } from "../src/event-to-object";

describe("serializeEvent", () => {
  it("correctly handles clipboard events", () => {
    const event = {
      type: "copy",
      clipboardData: {
        data: "test"
      }
    };
    const result = serializeEvent(event);
    expect(result.clipboardData).toEqual({ data: "test" });
    expect(result.type).toBeUndefined();
  });
  it("returns empty object for specific events", () => {
    const events = [
      {
        type: "select"
      },
      {
        type: "toggle"
      },
      {
        type: "load"
      },
      {
        type: "waitng"
      },
      {
        type: "blur"
      }
    ];
    const result = events.map(event => serializeEvent(event));
    result.map(item => expect(item).toEqual({}));
  });
});
