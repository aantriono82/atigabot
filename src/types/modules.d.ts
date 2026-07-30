declare module "*.ttf" {
  const data: ArrayBuffer;
  export default data;
}

declare module "*.wasm" {
  const wasmModule: WebAssembly.Module;
  export default wasmModule;
}
