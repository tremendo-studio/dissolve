import { ImageUploader } from "./components/file-field"

function App() {
  // const [count, setCount] = createSignal(0)

  return (
    <div class="flex h-svh flex-col gap-y-4 bg-stone-900 px-7 py-12 font-mono font-semibold text-stone-100">
      <h1 class="text-center text-3xl">Dissolve</h1>
      <ImageUploader />
    </div>
  )
}

export default App
