import { Progress } from "@kobalte/core/progress"
import {
  Accessor,
  createEffect,
  createMemo,
  createResource,
  createSignal,
  Match,
  on,
  onCleanup,
  onMount,
  Switch,
} from "solid-js"
import { Slider } from "./slider"

type Point = {
  x: number
  y: number
  originalX: number
  originalY: number
  r: number
  g: number
  b: number
  a: number
}

type ImageData = {
  width: number
  height: number
  pixelData: Point[]
}

export function ImagePreview({ image }: { image: File }) {
  let canvasRef!: HTMLCanvasElement
  let dissolveRef!: HTMLElement

  let [progress, setProgress] = createSignal(0)
  let [imageData, setImageData] = createSignal<ImageData | null>(null)

  let [opacity, setOpacity] = createSignal([0.7])
  let [radius, setRadius] = createSignal([3])
  let [speedX, setSpeedX] = createSignal([0.2])
  let [speedY, setSpeedY] = createSignal([0.2])
  let [scale, setScale] = createSignal([1])

  let isLoading = () => progress() < 100

  onMount(async () => {
    let img = await createImageBitmap(image)

    let maxWidth = 360
    let maxHeight = 360

    let width = img.width
    let height = img.height
    let aspectRatio = width / height

    let { canvasWidth, canvasHeight } =
      width > height
        ? { canvasWidth: maxWidth, canvasHeight: maxWidth / aspectRatio }
        : { canvasWidth: maxHeight * aspectRatio, canvasHeight: maxHeight }

    let offscreenCanvas = new OffscreenCanvas(canvasWidth, canvasHeight)
    let ctx = offscreenCanvas.getContext("2d")!

    ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight)
    let imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight)
    let data = imageData.data
    let step = 10

    let points = []
    for (let y = 0; y < offscreenCanvas.height; y += step) {
      setProgress((y / offscreenCanvas.height) * 100)
      await new Promise((resolve) => setTimeout(resolve, 50))

      for (let x = 0; x < offscreenCanvas.width; x += step) {
        let index = (y * offscreenCanvas.width + x) * 4

        let r = data[index]
        let g = data[index + 1]
        let b = data[index + 2]
        let a = data[index + 3] / 255

        let randomOpacity = Math.random() > opacity()[0] ? 0 : a
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${randomOpacity})`

        points.push({
          x,
          y,
          originalX: x,
          originalY: y,
          r,
          g,
          b,
          a,
        })
      }
    }

    setProgress(100)
    setImageData({ pixelData: points, width: canvasWidth, height: canvasHeight })
  })

  createEffect(() => {
    if (progress() !== 100 || !imageData()) return

    let { pixelData, width, height } = imageData()!
    let scaleFactor = scale()[0] // Get scale factor

    let points = pixelData.map((point) => ({
      ...point,
      color: `rgba(${point.r}, ${point.g}, ${point.b}, ${Math.random() > opacity()[0] ? 0 : point.a})`,
      offsetX: Math.random() * 2 - 1,
      offsetY: Math.random() * 2 - 1,
      speedX: (Math.random() - 0.5) * speedX()[0],
      speedY: (Math.random() - 0.5) * speedY()[0],

      scaledX: point.originalX * scaleFactor,
      scaledY: point.originalY * scaleFactor,
    }))

    let frame = requestAnimationFrame(loop)
    canvasRef.width = width * scaleFactor
    canvasRef.height = height * scaleFactor

    function loop() {
      frame = requestAnimationFrame(loop)

      let maxOffset = 5 * scaleFactor
      let ctx = canvasRef.getContext("2d")!
      let radiusValue = radius()[0] * scaleFactor

      ctx.clearRect(0, 0, canvasRef.width, canvasRef.height)

      for (let point of points) {
        point.offsetX += point.speedX
        point.offsetY += point.speedY

        if (Math.abs(point.offsetX) > maxOffset) point.speedX *= -1
        if (Math.abs(point.offsetY) > maxOffset) point.speedY *= -1

        ctx.fillStyle = point.color
        ctx.beginPath()

        ctx.arc(
          point.scaledX + point.offsetX + radiusValue,
          point.scaledY + point.offsetY + radiusValue,
          radiusValue,
          0,
          Math.PI * 2,
        )

        ctx.fill()
      }
    }

    onCleanup(() => cancelAnimationFrame(frame))
  })

  createEffect(() => {
    if (!isLoading()) {
      console.debug("Setting attributes")
      dissolveRef.setAttribute("points", JSON.stringify(imageData()))
      dissolveRef.setAttribute("radius", String(radius()[0]))
    }
  })

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
          <div class="fixed inset-0 flex -translate-y-2.5 items-center justify-center">
            <canvas ref={canvasRef}></canvas>
          </div>
          <tremendo-dissolve ref={dissolveRef}></tremendo-dissolve>
          <div class="absolute bottom-0 w-full max-w-[360px] py-4">
            <Slider onChange={setOpacity} value={opacity()} maxValue={1} step={0.001} />
            <Slider onChange={setRadius} value={radius()} maxValue={20} minValue={2} step={0.1} />
            <Slider onChange={setSpeedX} value={speedX()} maxValue={5} minValue={0} step={0.01} />
            <Slider onChange={setSpeedY} value={speedY()} maxValue={5} minValue={0} step={0.01} />
            <Slider onChange={setScale} value={scale()} maxValue={10} minValue={0.5} step={0.01} />
          </div>
        </Match>
      </Switch>
    </div>
  )
}
