// ISC, Copyright 2017 Jaco Greeff
// @flow

declare class WebAssembly$Module {
  constructor (code: Uint8Array): WebAssembly$Module;
}

declare type WebAssembly$Instance$Exports = {
  [string]: (any) => any
}

declare class WebAssembly$Instance {
  exports: WebAssembly$Instance$Exports;

  constructor (module: WebAssembly$Module, imports?: WebAssembly$Imports): WebAssembly$Instance;
}

declare type WebAssembly$Memory$Config = {
  initial: number
}

declare type WebAssembly$Table$Config = {
  initial: number,
  element: 'anyfunc'
}

declare class WebAssembly$Memory {
  constructor (config: WebAssembly$Memory$Config): WebAssembly$Memory
}

declare class WebAssembly$Table {
  constructor (config: WebAssembly$Table$Config): WebAssembly$Table
}

declare type WebAssembly$Imports = {
  env?: {
    memory?: WebAssembly$Memory,
    memoryBase?: number,
    table?: WebAssembly$Table,
    tableBase?: number
  }
}

declare class WebAssembly {
  static compile (array: Uint8Array): WebAssembly$Module;
  static instantiate (bytecode: Uint8Array, imports?: WebAssembly$Imports): Promise<{
    module: WebAssembly$Module,
    instance: WebAssembly$Instance
  }>;
  static validate (bytecode: Uint8Array): boolean;

  static Instance: Class<WebAssembly$Instance>;
  static Memory: Class<WebAssembly$Memory>;
  static Module: Class<WebAssembly$Module>;
  static Table: Class<WebAssembly$Table>;
}
