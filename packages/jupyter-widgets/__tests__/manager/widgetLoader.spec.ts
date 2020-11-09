import { requireLoader } from "../../src/manager/widgetLoader";

// A mock valid module representing a custom widget
const mockModule = {
  "foo" : "bar"
};
// Info representing an invalid module for testing the failure case
const invalidModule = { 
  name: "invalid_module",
  version: "1.0",
  url: "https://unpkg.com/invalid_module@1.0/dist/index.js"
};
// Mock implementation of the core require API
const mockRequireJS = jest.fn((modules, ready, errCB) => {
  if(modules.length > 0 && modules[0] == invalidModule.url){
    errCB(new Error('Whoops!'));
  }
  else {
    ready(mockModule);
  } 
});

// Callback binding
const mockSuccessCB = jest.fn();
const mockErrorCB = jest.fn();
(window as any).requirejs = mockRequireJS;
(window as any).requirejs.config  = jest.fn();

describe("requireLoader", () => {
  beforeAll(() => {
    jest.clearAllMocks();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it("Returns a module if linked to a valid CDN URL", () => {
    requireLoader("foo", "1.0.0", mockSuccessCB, mockErrorCB);
    expect(mockRequireJS).toHaveBeenCalledTimes(1);
    
    const moduleURLs = mockRequireJS.mock.calls[0][0];
    expect(moduleURLs).not.toBe(null);
    expect(moduleURLs.length).toBe(1);
    expect(moduleURLs[0]).toBe("https://unpkg.com/foo@1.0.0/dist/index.js");
    expect(mockSuccessCB).toHaveBeenCalledWith(mockModule);
  });

  it("Returns a module even when module version is missing", () => {
    requireLoader("foo", undefined, mockSuccessCB, mockErrorCB);
    expect(mockRequireJS).toHaveBeenCalledTimes(1);
    
    const moduleURLs = mockRequireJS.mock.calls[0][0];
    expect(moduleURLs).not.toBe(null);
    expect(moduleURLs.length).toBe(1);
    expect(moduleURLs[0]).toBe("https://unpkg.com/foo/dist/index.js");
    expect(mockSuccessCB).toHaveBeenCalledWith(mockModule);
  });

  it("Calls the error callback if an error is encountered during the module loading", () => {   
    const {name, version} = invalidModule;
    requireLoader(name, version, mockSuccessCB, mockErrorCB);
    expect(mockRequireJS).toHaveBeenCalledTimes(1);
    expect(mockSuccessCB).toBeCalledTimes(0);
    expect(mockErrorCB).toBeCalledTimes(1);
  });
});
