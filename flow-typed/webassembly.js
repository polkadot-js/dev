// @flow

declare class WebAssemblyModule {
  constructor (code: Uint8Array): WebAssemblyModule;
}

declare type WebAssemblyInstance$Exports = {
  [string]: (any) => any
}

declare class WebAssemblyInstance {
  exports: WebAssemblyInstance$Exports;

  constructor (module: WebAssemblyModule, imports?: WebAssemblyImports): WebAssemblyInstance;
}

declare type WebAssemblyMemory$Config = {
  initial: number
}

declare type WebAssemblyTable$Config = {
  initial: number,
  element: 'anyfunc'
}

declare class WebAssemblyMemory {
  constructor (config: WebAssemblyMemory$Config): WebAssemblyMemory
}

declare class WebAssemblyTable {
  constructor (config: WebAssemblyTable$Config): WebAssemblyTable
}

declare type WebAssemblyImports = {
  env?: {
    memory?: WebAssemblyMemory,
    memoryBase?: number,
    table?: WebAssemblyTable,
    tableBase?: number
  },
  [string]: {
    [string]: (any) => any
  }
}

declare class WebAssembly {
  static compile (array: Uint8Array): WebAssemblyModule;
  static instantiate (bytecode: Uint8Array, imports?: WebAssemblyImports): Promise<{
    module: WebAssemblyModule,
    instance: WebAssemblyInstance
  }>;
  static validate (bytecode: Uint8Array): boolean;

  static Instance: Class<WebAssemblyInstance>;
  static Memory: Class<WebAssemblyMemory>;
  static Module: Class<WebAssemblyModule>;
  static Table: Class<WebAssemblyTable>;
}
