import { FileField } from "@kobalte/core/file-field"
import { ImagePreview } from "./image-preview"
import { createSignal, Match, Switch } from "solid-js"

export function ImageUploader() {
  let [showPreview, setShowPreview] = createSignal(false)
  let [file, setFile] = createSignal<File | undefined>(undefined)

  return (
    <div>
      <FileField
        class="m-auto flex max-w-lg flex-col gap-y-1"
        maxFiles={1}
        onFileAccept={(data) => {
          setShowPreview(true)
          setFile(data[0])
        }}
        onFileReject={(data) => console.log("File reject", data)}
        onFileChange={(data) => console.log("File change", data)}
      >
        <Switch>
          <Match when={!showPreview()}>
            <div class="m-auto flex w-full max-w-[360px] flex-col items-center gap-y-2 border-2 border-dashed border-stone-600 text-sm font-normal">
              <FileField.Dropzone class="flex flex-col gap-y-2 p-4">
                Drop your image here...
                <FileField.Trigger class="cursor-pointer rounded-sm bg-slate-500 px-4 py-2 transition-colors hover:bg-slate-400">
                  Upload
                </FileField.Trigger>
              </FileField.Dropzone>
              <FileField.HiddenInput />
            </div>
          </Match>
          <Match when={showPreview() && file()}>
            <div class="m-auto flex w-full max-w-[360px] flex-col items-center gap-y-2 p-4 text-sm font-normal">
              <ImagePreview image={file()!} />
            </div>
          </Match>
        </Switch>
      </FileField>
    </div>
  )
}
