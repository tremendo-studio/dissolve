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
      randomOpacity: number
      originalX: number
      originalY: number
    }[]
  >([])

  let [imageBitmap] = createResource(image, () => createImageBitmap(image))

  let timer = setInterval(() => {
    if (progress() < 73) {
      setProgress(progress() === 0 ? 5 : Math.floor(progress() * 1.5))
      return
    } else if (progress() >= 73 && progress() < 100) {
      setProgress(progress() + 1)
      return
    }
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
    let pixelSize = 10 // Adjust for bigger/smaller circles

    ctx.clearRect(0, 0, canvas.width, canvas.height) // Clear the canvas

    let newData = []

    for (let y = 0; y < canvas.height; y += pixelSize) {
      for (let x = 0; x < canvas.width; x += pixelSize) {
        let index = (y * canvas.width + x) * 4
        let r = data[index]
        let g = data[index + 1]
        let b = data[index + 2]
        let a = data[index + 3] / 255

        // Apply random opacity
        let randomOpacity = Math.random() > opacity()[0] ? 0 : a

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${randomOpacity})`

        // Draw circle
        // ctx.beginPath()
        // ctx.arc(x + radius, y + radius, radius, 0, Math.PI * 2)
        // ctx.fill()

        newData.push({
          x,
          y,
          originalX: x,
          originalY: y,
          color: `rgba(${r}, ${g}, ${b}, ${randomOpacity})`,
          offsetX: Math.random() * 2 - 1, // Random small offset
          offsetY: Math.random() * 2 - 1, // Random small offset
          speedX: (Math.random() - 0.5) * speedX()[0], // Small speed in X
          speedY: (Math.random() - 0.5) * speedY()[0], // Small speed in Y
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
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height) // Clear the canvas

    shapesData().forEach((p) => {
      // Update position with a slight oscillation effect
      p.offsetX += p.speedX
      p.offsetY += p.speedY

      //   let radius = 5

      // Keep particles floating near their original position
      let maxOffset = 5 // Maximum displacement in any direction
      if (Math.abs(p.offsetX) > maxOffset) p.speedX *= -1
      if (Math.abs(p.offsetY) > maxOffset) p.speedY *= -1

      // Draw floating circle
      ctx.fillStyle = p.color
      ctx.beginPath()
      ctx.arc(
        p.originalX + p.offsetX + radius()[0],
        p.originalY + p.offsetY + radius()[0],
        radius()[0],
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
        <Match when={progress() < 100}>
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
        <Match when={progress() === 100}>
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
