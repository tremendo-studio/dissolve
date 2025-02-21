import { createScriptLoader } from "@solid-primitives/script-loader"
import { ImageUploader } from "./components/file-field"
import { createEffect } from "solid-js"

function App() {
  createScriptLoader({
    src: "http://localhost:4173/tremendo-dissolve.iife.js",
    async onLoad() {},
  })

  createEffect(() => {
    customElements
      .whenDefined("tremendo-dissolve")
      .then(() => console.debug("Custom element defined"))
  })

  return (
    <div class="flex h-svh flex-col gap-y-4 bg-stone-900 px-7 py-12 font-mono font-semibold text-stone-100">
      <h1 class="z-10 text-center text-3xl">Dissolve</h1>
      <ImageUploader />
    </div>
  )
}

export default App
