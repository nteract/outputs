
# Implementing Jupyter Widgets
1. Extend the `ManageBase` class (I'll refer to this as your `Manager` class going forward)
2. Implement the loadClass function. This will be called whenever a new widget is created, and essentially just maps a string like `“@jupyter-widgets/controls”` to the module. Unless you are writing custom widgets, you can just copy this from the examples.
```
// Declared at top of file:
// const base  =  require('@jupyter-widgets/base');
// const controls  =  require('@jupyter-widgets/controls');

// Within your concrete Manage class
loadClass(className, moduleName, moduleVersion) {
	return  new  Promise(function(resolve, reject) {
		if (moduleName  ===  '@jupyter-widgets/controls') {
			resolve(controls);
		} else  if (moduleName  ===  '@jupyter-widgets/base') {
			resolve(base)
		} else {
			//Can't find, do what you want in this case
			//To support custom widgets, load from unpkg
		}
	}).then(function(module) {
		if (module[className]) {
			return  module[className];
		} else {
			return  Promise.reject(`Class ${className} not found in module${moduleName}@${moduleVersion}`);
		}
	});
}
```
3. Test that everything is working so far by creating a (nonfunction, but visible) widget
```
const state = getStateFromCommsOrFile() // You get this state as an incoming comm from the kernel
const let  modelInfo  = {
	model_id:  getModelOrCommId(), // This is the comm_id field of the message you got from the kernel
	model_name:  state._model_name,
	model_module:  state._model_module,
	model_module_version:  state._module_version,
	view_name:  state._view_name,
	view_module:  state._view_module,
	view_module_version:  state._view_module_version
};
const widget_model = await manager.new_model(modelInfo, state) 
const widget_view = await manager.create_view(widget_model)
widget_view.el = getElementIWantToRenderTo() // This wont work for all widgets. We will replace this later
```
4. Implement the `IClassicComm` interface. How you implement this depends solely on how your app communicates with the Kernel, so the only real direction I can give here is with the callbacks. This is  the decision tree for which you should call the callback functions depending on the reply. You will be implementing some of these later.
```
if (reply.channel  ==  "shell"  &&  callbacks.shell  &&  callbacks.shell.reply) {
	callbacks.shell.reply(reply);
} else  if (reply.channel  ==  "stdin"  &&  callbacks.input) {
	callbacks.input(reply);
} else  if (reply.channel  ==  "iopub"  &&  callbacks.iopub) {
	if (callbacks.iopub.status  &&  reply.header.msg_type  ===  "status") {
		callbacks.iopub.status(reply);
	} else  if (callbacks.iopub.clear_output  &&  reply.header.msg_type  ===  "clear_output") {
		callbacks.iopub.clear_output(reply);
	} else  if (callbacks.iopub.output) {
		switch (reply.header.msg_type) {
			case  "display_data":
			case  "execute_result":
			case  "stream":
			case  "error":
				callbacks.iopub.output(reply);
				break;
			default:
				break;
		}
	}
}
```
5. Write your `_create_comm` function in your `Manager` class. This will basically just instantiate your implementation of the `IClassicComm` you just made.
6. Write your `display_view` function in your `Manager` class. It is tempting to simply use `view.setElement(el)` and pass in the element you want this displayed to. **Do not do this!** Some widgets, specifically Box based widgets, are designed to make their own Phosphor element and not allow their element to be set. I highly, *highly*, recommend that you just use Phosphor. If you do, all you need to write is something like this:
```
display_view(msg:  KernelMessage.IMessage, view:  base.DOMWidgetView, options:  any):  Promise<base.DOMWidgetView> {
	pWidget.Widget.attach(view.pWidget, options.el);
}
```
7. If you decide not to use Phosphor in step 6, you need to:
	* Call `view.trigger("displayed")`
	* Call `view.delegateEvents()`
	* Figure out a way to display the Box elements without passing your own in. You can possibly get away with something like `el.appendChild(view.el)`, but I have not tried this.
8. In your `ManagerBase` class, implement your `callbacks()` function. This will return an object that looks something like this. Again, though, your functions here will depend entirely on your implementation of your notebook app.
```
{
	iopub: {
		output: outputFunc,
		clear_output: clearOutputFunc,
		status: statusFunc
	},
	shell: {
		reply: shellReplyFunc
	},
	input: inputFunc
}
``` 
9. At this point, your widgets should be working but breaking when you restart your notebook. In order to fix this, you will need to request the state from the server. To do this, you need to send a comm_msg with the following
```
{
	...
	data: {
		method: "request_state"
	}
}
``` 
10. Because you can have multiple views for the same widget, you need to make sure you are not creating the same widget model multiple times. You can do this by calling `Manager.get_model(model_id)` and not creating the model if it doesn't return undefined. Note that this means that you want your `Manager` to be a Singleton class, so that you don't have different `Manager`s making them same models.

