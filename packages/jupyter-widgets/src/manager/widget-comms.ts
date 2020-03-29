import { IClassicComm } from "@jupyter-widgets/base";
import {
  childOf,
  createCommMessage,
  createCommOpenMessage,
  JupyterMessage,
  ofMessageType,
  withCommId
} from "@nteract/messaging";

/**
 * Class used by widgets to communicate with the backend
 */
export class WidgetComm implements IClassicComm {
  comm_id: string;
  target_name: string;
  target_module: string;
  kernel: any;

  /**
   *
   * @param comm_id uuid
   * @param target_name comm handler
   * @param target_module used to select a module that is responsible for handling the target_name
   * @param kernel A reference to the
   */
  constructor(
    comm_id: string,
    target_name: string,
    target_module: string,
    kernel: any
  ) {
    this.comm_id = comm_id;
    this.target_name = target_name;
    this.target_module = target_module;
    this.kernel = kernel;
  }

  /**
   * Opens a sibling comm in the backend
   * @param  data
   * @param  callbacks
   * @param  metadata
   * @return msg id
   */
  open(
    data: any,
    callbacks: any,
    metadata?: any,
    buffers?: ArrayBuffer[] | ArrayBufferView[]
  ): string {
    const message = createCommOpenMessage(
      this.comm_id,
      this.target_name,
      this.flattenBufferArrays(buffers),
      this.target_module
    );
    this.kernel.channels.next(message);
    this.hookupReplyCallbacks(message, callbacks);
    return message.header.msg_id;
  }

  /**
   * Sends a message to the sibling comm in the backend
   * @param  data
   * @param  callbacks
   * @param  metadata
   * @param  buffers
   * @return message id
   */
  send(
    data: any,
    callbacks: any,
    metadata?: any,
    buffers?: ArrayBuffer[] | ArrayBufferView[]
  ): string {
    const message = createCommMessage(
      this.comm_id,
      data,
      this.flattenBufferArrays(buffers)
    );
    this.kernel.channels.next(message);
    this.hookupReplyCallbacks(message, callbacks);
    return message.header.msg_id;
  }

  /**
   * Closes the sibling comm in the backend
   * @param  data
   * @param  callbacks
   * @param  metadata
   * @return msg id
   */
  close(
    data?: any,
    callbacks?: any,
    metadata?: any,
    buffers?: ArrayBuffer[] | ArrayBufferView[]
  ): string {
    throw new Error("close not yet implemented!");
  }

  /**
   * Register a message handler
   * @param  callback, which is given a message
   */
  on_msg(callback: (x: any) => void): void {
    this.kernel.channels
      .pipe(ofMessageType("comm_msg"), withCommId(this.comm_id))
      .subscribe((msg: any) => {
        callback(msg);
      });
  }

  /**
   * Register a handler for when the comm is closed by the backend
   * @param  callback, which is given a message
   */
  on_close(callback: (x: any) => void): void {
    this.kernel.channels
      .pipe(ofMessageType("comm_close"), withCommId(this.comm_id))
      .subscribe((msg: any) => {
        callback(msg);
      });
  }

  /**
   * Convert the buffer array that iPyWidgets use into the single
   * Uint8Array that nteract expects for creating messages
   * @param buffers iPyWidgets buffer format
   * @return nteract buffer format
   */
  flattenBufferArrays(
    buffers?: ArrayBuffer[] | ArrayBufferView[]
  ): Uint8Array | undefined {
    if (buffers === undefined) {
      return undefined;
    }
    // determining size and creating array
    let byteLength = 0;
    for (const b of buffers) {
      byteLength += b.byteLength;
    }
    const flattened = new Uint8Array(byteLength);
    // copying buffers over
    for (const b of buffers) {
      const arr =
        b instanceof ArrayBuffer ? new Uint8Array(b) : (b as Uint8Array);
      flattened.set(arr);
    }
    return flattened;
  }

  /**
   * Subscribes to message replies and routes them to the right callbacks
   * provided by widgets
   * @param message
   * @param callbacks
   */
  hookupReplyCallbacks(message: JupyterMessage<any, any>, callbacks: any) {
    this.kernel.channels.pipe(childOf(message)).subscribe((reply: any) => {
      if (
        reply.channel === "shell" &&
        callbacks.shell &&
        callbacks.shell.reply
      ) {
        callbacks.shell.reply(reply);
      } else if (reply.channel === "stdin" && callbacks.input) {
        callbacks.input(reply);
      } else if (reply.channel === "iopub" && callbacks.iopub) {
        if (callbacks.iopub.status && reply.header.msg_type === "status") {
          callbacks.iopub.status(reply);
        } else if (
          callbacks.iopub.clear_output &&
          reply.header.msg_type === "clear_output"
        ) {
          callbacks.iopub.clear_output(reply);
        } else if (callbacks.iopub.output) {
          switch (reply.header.msg_type) {
            case "display_data":
            case "execute_result":
            case "stream":
            case "error":
              callbacks.iopub.output(reply);
              break;
            default:
              break;
          }
        }
      }
    });
  }
}

/**
 * Requests the state of a model from the kernel. This method is static because it
 * needs to be called before a Comm object is made
 * @param kernel
 * @param comm_id
 */
export function request_state(kernel: any, comm_id: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const message = createCommMessage(comm_id, { method: "request_state" });
    const replySubscription = kernel.channels
      .pipe(childOf(message))
      .subscribe((reply: any) => {
        // if we get a comm message back, it is the state we requested
        if (reply.msg_type === "comm_msg") {
          replySubscription.unsubscribe();
          return resolve(reply);
        }
        // otherwise, if we havent gotten a comm message and it goes idle, it wasn't found
        else if (
          reply.msg_type === "status" &&
          reply.content.execution_state === "idle"
        ) {
          replySubscription.unsubscribe();
          return reject(`'${comm_id}' could not be found`);
        }
      });
    kernel.channels.next(message);
  });
}
