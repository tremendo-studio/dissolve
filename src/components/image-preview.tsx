import { Progress } from "@kobalte/core/progress"
import {
  Accessor,
  createEffect,
  createResource,
  createSignal,
  Match,
  onCleanup,
  Switch,
} from "solid-js"
import { Slider } from "./slider"

export function ImagePreview({ image }: { image: File }) {
  let [progress, setProgress] = createSignal(0)

  let [opacity, setOpacity] = createSignal([0.7])
  let [radius, setRadius] = createSignal([3])
  let [speedX, setSpeedX] = createSignal([0.2])
  let [speedY, setSpeedY] = createSignal([0.2])

  let [shapesData, setShapesData] = createSignal<
    {
      x: number
      y: number
      color: string
      speedX: number
      speedY: number
      offsetX: number
      offsetY: number
      originalX: number
      originalY: number
    }[]
  >([])

  let isLoading = () => progress() < 100

  let [imageBitmap] = createResource(image, async () => {
    let img = await createImageBitmap(image)
    let cnv = new OffscreenCanvas(img.width, img.height)
    let ctx = cnv.getContext("2d")!

    cnv.width = img.width
    cnv.height = img.height

    ctx.drawImage(img, 0, 0)
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    let data = imageData.data
    let pixelSize = Math.floor(cnv.width / 100)

    let rows = []
    for (let y = 0; y < cnv.height; y += pixelSize) {
      rows.push
    }
  })

  let timer = setInterval(() => {
    if (progress() < 73) return setProgress((prev) => (prev === 0 ? 5 : Math.floor(prev * 1.5)))
    if (progress() >= 73 && progress() < 100) return setProgress((prev) => prev + 1)
    clearInterval(timer)
  }, 100)
  onCleanup(() => clearInterval(timer))

  createEffect(() => {
    let ctx = canvas.getContext("2d")
    let img = imageBitmap()
    let pendingProgress = progress() < 100

    if (!ctx || pendingProgress || !img) return

    canvas.width = img.width
    canvas.height = img.height

    ctx.drawImage(img, 0, 0)
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    let data = imageData.data
    let pixelSize = Math.floor(canvas.width / 100)

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    let newData = []

    for (let y = 0; y < canvas.height; y += pixelSize) {
      for (let x = 0; x < canvas.width; x += pixelSize) {
        let index = (y * canvas.width + x) * 4
        let r = data[index]
        let g = data[index + 1]
        let b = data[index + 2]
        let a = data[index + 3] / 255

        let randomOpacity = Math.random() > opacity()[0] ? 0 : a
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${randomOpacity})`

        newData.push({
          x,
          y,
          originalX: x,
          originalY: y,
          color: `rgba(${r}, ${g}, ${b}, ${randomOpacity})`,
          offsetX: Math.random() * 2 - 1,
          offsetY: Math.random() * 2 - 1,
          speedX: (Math.random() - 0.5) * speedX()[0],
          speedY: (Math.random() - 0.5) * speedY()[0],
        })
      }
    }

    setShapesData(newData)
  })

  let canvas = (
    <canvas id="canvas-preview" class="aspect-auto max-w-full"></canvas>
  ) as HTMLCanvasElement

  let animate = () => {
    let ctx = canvas.getContext("2d")
    let radiusValue = radius()[0]
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    shapesData().forEach((p) => {
      p.offsetX = p.offsetX + p.speedX
      p.offsetY = p.offsetY + p.speedY

      let maxOffset = 5

      if (Math.abs(p.offsetX) > maxOffset) p.speedX = p.speedX * -1
      if (Math.abs(p.offsetY) > maxOffset) p.speedY = p.speedY * -1

      ctx.fillStyle = p.color
      ctx.beginPath()
      ctx.arc(
        p.originalX + p.offsetX + radiusValue,
        p.originalY + p.offsetY + radiusValue,
        radiusValue,
        0,
        Math.PI * 2,
      )
      ctx.fill()
    })

    requestAnimationFrame(animate)
  }

  animate()

  return (
    <div class="flex w-full flex-col items-center p-4 text-sm">
      <Switch>
        <Match when={isLoading()}>
          <Progress class="flex w-full flex-col gap-y-0.5" value={progress()}>
            <div>
              <Progress.Label>Processing file...</Progress.Label>
              <Progress.ValueLabel />
            </div>
            <Progress.Track class="h-4 w-full bg-stone-600">
              <Progress.Fill class="h-4 w-(--kb-progress-fill-width) bg-stone-400 transition-[width] duration-100" />
            </Progress.Track>
          </Progress>
        </Match>
        <Match when={!isLoading()}>
          {canvas}
          <div class="w-full py-4">
            <Slider onChange={setOpacity} value={opacity()} maxValue={1} step={0.001} />
            <Slider onChange={setRadius} value={radius()} maxValue={20} minValue={2} step={0.1} />
            <Slider onChange={setSpeedX} value={speedX()} maxValue={5} minValue={0} step={0.01} />
            <Slider onChange={setSpeedY} value={speedY()} maxValue={5} minValue={0} step={0.01} />
          </div>
        </Match>
      </Switch>
    </div>
  )
}
