import { from, Subject } from "rxjs";

import { DescriptionStyleModel } from "@jupyter-widgets/controls";
import { request_state, WidgetComm } from "../../src/manager/widget-comms";

describe("WidgetComm", () => {
  it("cam be instantied", () => {
    const comm_id = "aCommId";
    const target_name = "target_name";
    const target_module = "target_module";
    const kernel = { channels: new Subject() };
    const comm = new WidgetComm(comm_id, target_name, target_module, kernel);
    expect(comm.comm_id).toEqual(comm_id);
    expect(comm.target_name).toEqual(target_name);
    expect(comm.target_module).toEqual(target_module);
    expect(comm.kernel).toEqual(kernel);
  });
  it("can send a comm_open message", () => {
    const comm_id = "aCommId";
    const target_name = "target_name";
    const target_module = "target_module";
    const kernel = {
      channels: {
        next: jest.fn(),
        pipe: jest.fn(() => ({ subscribe: jest.fn() }))
      }
    };
    const comm = new WidgetComm(comm_id, target_name, target_module, kernel);
    comm.open({ target_name: "target_name" }, {});
    expect(kernel.channels.next).toBeCalled();
    expect(kernel.channels.pipe).toBeCalled();
  });
  it("can send messages", () => {
    const comm_id = "aCommId";
    const target_name = "target_name";
    const target_module = "target_module";
    const kernel = {
      channels: {
        next: jest.fn(),
        pipe: jest.fn(() => ({ subscribe: jest.fn() }))
      }
    };
    const comm = new WidgetComm(comm_id, target_name, target_module, kernel);
    comm.send({ target_name: "target_name" }, {});
    expect(kernel.channels.next).toBeCalled();
    expect(kernel.channels.pipe).toBeCalled();
  });
});

describe("flattenBufferArrays", () => {
  it("can handle undefined buffers", () => {
    const comm_id = "aCommId";
    const target_name = "target_name";
    const target_module = "target_module";
    const kernel = { channels: new Subject() };
    const comm = new WidgetComm(comm_id, target_name, target_module, kernel);
    expect(comm.flattenBufferArrays()).toBeUndefined();
  });
  it("can handle valid buffers", () => {
    const comm_id = "aCommId";
    const target_name = "target_name";
    const target_module = "target_module";
    const kernel = { channels: new Subject() };
    const comm = new WidgetComm(comm_id, target_name, target_module, kernel);
    const result = comm.flattenBufferArrays([
      new ArrayBuffer(8),
      new ArrayBuffer(4)
    ]);
    expect(result).toBeDefined();
    expect(result.length).toEqual(
      new ArrayBuffer(8).byteLength + new ArrayBuffer(4).byteLength
    );
  });
});

describe("request_state", () => {
  it("sends request_state message and processes responses", done => {
    const kernel = {
      channels: {
        next: jest.fn(),
        pipe: jest.fn(() => ({
          subscribe: jest.fn()
        }))
      }
    };
    const comm_id = "test_comm_id";
    request_state(kernel, comm_id).then(() => {
      expect(kernel.channels.next).toBeCalledWith(
        expect.objectContaining({
          header: {
            msg_type: "comm_msg"
          }
        })
      );
      done();
    });
    done();
  });
});

describe("hookupReplyCallbacks", () => {
  const callbacks = {
    shell: {
      reply: jest.fn()
    },
    input: jest.fn(),
    iopub: {
      status: jest.fn(),
      clear_output: jest.fn(),
      output: jest.fn()
    }
  };
  it("can process shell channels reply messages", () => {
    const comm_id = "aCommId";
    const target_name = "target_name";
    const target_module = "target_module";
    const parentMessage = {
      header: {
        msg_id: "parent_message_id"
      }
    };
    const kernel = {
      channels: from([
        {
          channel: "shell",
          parent_header: parentMessage.header
        }
      ])
    };
    const comm = new WidgetComm(comm_id, target_name, target_module, kernel);
    comm.hookupReplyCallbacks(parentMessage, callbacks);
    expect(callbacks.shell.reply).toBeCalled();
  });
  it("can process input requests", () => {
    const comm_id = "aCommId";
    const target_name = "target_name";
    const target_module = "target_module";
    const parentMessage = {
      header: {
        msg_id: "parent_message_id"
      }
    };
    const kernel = {
      channels: from([
        {
          channel: "stdin",
          parent_header: parentMessage.header
        }
      ])
    };
    const comm = new WidgetComm(comm_id, target_name, target_module, kernel);
    comm.hookupReplyCallbacks(parentMessage, callbacks);
    expect(callbacks.input).toBeCalled();
  });
  it("can process ioupub status messages", () => {
    const comm_id = "aCommId";
    const target_name = "target_name";
    const target_module = "target_module";
    const parentMessage = {
      header: {
        msg_id: "parent_message_id"
      }
    };
    const kernel = {
      channels: from([
        {
          channel: "iopub",
          parent_header: parentMessage.header,
          header: {
            msg_type: "status"
          }
        },
        {
          channel: "iopub",
          parent_header: parentMessage.header,
          header: {
            msg_type: "clear_output"
          }
        },
        {
          channel: "iopub",
          parent_header: parentMessage.header,
          header: {
            msg_type: "display_data"
          }
        }
      ])
    };
    const comm = new WidgetComm(comm_id, target_name, target_module, kernel);
    comm.hookupReplyCallbacks(parentMessage, callbacks);
    expect(callbacks.iopub.status).toBeCalled();
    expect(callbacks.iopub.clear_output).toBeCalled();
    expect(callbacks.iopub.output).toBeCalled();
  });
});
