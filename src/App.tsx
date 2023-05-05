import { createSignal } from "solid-js";
import logo from "./assets/logo.svg";
import { invoke } from "@tauri-apps/api/tauri";
import { readBinaryFile , BaseDirectory} from "@tauri-apps/api/fs"

declare global {
  interface Window { _z85: (input: string, remainder: number[]) => void; }
}

let z0: DOMHighResTimeStamp;

const OCTETS = [
  0xFF, 0x44, 0xFF, 0x54, 0x53, 0x52, 0x48, 0xFF, 0x4B, 0x4C, 0x46, 0x41, 0xFF, 0x3F, 0x3E, 0x45,
  0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x40, 0xFF, 0x49, 0x42, 0x4A, 0x47,
  0x51, 0x24, 0x25, 0x26, 0x27, 0x28, 0x29, 0x2A, 0x2B, 0x2C, 0x2D, 0x2E, 0x2F, 0x30, 0x31, 0x32,
  0x33, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3A, 0x3B, 0x3C, 0x3D, 0x4D, 0xFF, 0x4E, 0x43, 0xFF,
  0xFF, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18,
  0x19, 0x1A, 0x1B, 0x1C, 0x1D, 0x1E, 0x1F, 0x20, 0x21, 0x22, 0x23, 0x4F, 0xFF, 0x50, 0xFF, 0xFF,
];

window._z85 = function(input, remainder) {
  let chunks = Math.ceil(input.length / 5);
  let buffer = new Uint8Array(Math.ceil((chunks * 4)+ remainder.length));
  for (let i = 0; i < chunks; i++) {
    const start = i * 5;
    let chunk = input.substring(start, start + 5)
    let raw = 0;
    for (const char of chunk) {
      const idx = char.charCodeAt(0) - 32;
      raw *= 85;
      raw += OCTETS[idx]
    }
    
    const view = new DataView(buffer.buffer)
    view.setUint32(i * 4, raw, false /* big endian */);
  }

  let results = document.querySelector(`#resultZ85`)
  if (results) {
    results.textContent = `${performance.now() - z0}ms`
  }
}

function App() {
   async function doReadBinaryFile() {
    const t0 = performance.now()
    const content = await readBinaryFile('1g.bin', { dir: BaseDirectory.Document })
    console.log(content.length)
      const t1 = performance.now();
  let results = document.querySelector(`#resultReadBinaryFile`)
  if (results) {
    results.textContent = `${t1 - t0}ms`
  }
  }

  async function doZ85() {
    z0 = performance.now()
    await invoke("read_z85")
  }

  return (
    <div class="h-full flex justify-center items-center">
      <ul class="w-96 h-full flex justify-around items-center">
        <li class="flex flex-col items-center">
          <button class="bg-stone-800 p-4 rounded-md" onClick={() => doReadBinaryFile()}><code>readBinaryFile()</code></button>
          <code><span id="resultReadBinaryFile">nul</span></code>
        </li>
        <li class="flex flex-col items-center">
          <button class="bg-stone-800 p-4 rounded-md" onClick={() => doZ85()}>z85</button>
          <code><span id="resultZ85">nul</span></code>
          </li>
      </ul>
    </div>
  );
}

export default App;
