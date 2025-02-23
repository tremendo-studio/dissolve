import { Progress } from '@kobalte/core/progress'
import { createEffect, createSignal, Match, onCleanup, onMount, Switch } from 'solid-js'
import { Slider } from './slider'

import { createAnimation } from '@tremendo-dissolve/dissolve'

type Point = {
  x: number
  y: number
  r: number
  g: number
  b: number
  a: number
}

type AnimationData = {
  width: number
  height: number
  pixels: Point[]
}

let html = String.raw

export function ImagePreview({ image }: { image: File }) {
  let animationContainer!: HTMLDivElement

  let [progress, setProgress] = createSignal(0)
  let [imageData, setImageData] = createSignal<AnimationData | null>(null)

  let [opacity, setOpacity] = createSignal([0.7])
  let [radius, setRadius] = createSignal([3])
  let [speedX, setSpeedX] = createSignal([0.2])
  let [speedY, setSpeedY] = createSignal([0.2])

  let [containerSize, setContainerSize] = createSignal({ width: 360, height: 360 })

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
    let ctx = offscreenCanvas.getContext('2d')!

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
          r,
          g,
          b,
          a,
        })
      }
    }

    setProgress(100)
    setImageData({ pixels: points, width: canvasWidth, height: canvasHeight })
  })

  createEffect(() => {
    if (isLoading() || !imageData()) return

    containerSize()

    let clean = createAnimation(animationContainer, {
      ...imageData()!,
      opacity: opacity()[0],
      speedX: speedX()[0],
      speedY: speedY()[0],
      radius: radius()[0],
    })

    onCleanup(clean)
  })

  createEffect(() => {
    if (isLoading() || !imageData()) return

    let resizeObserver = new ResizeObserver(() => {
      setContainerSize({
        width: animationContainer.offsetWidth,
        height: animationContainer.offsetHeight,
      })
    })
    resizeObserver.observe(animationContainer)
  })

  let copy = () => {
    let dataAnimation = btoa(
      JSON.stringify({
        ...imageData()!,
        opacity: opacity()[0],
        speedX: speedX()[0],
        speedY: speedY()[0],
        radius: radius()[0],
      }),
    )

    navigator.clipboard.writeText(
      html`<script
        type="module"
        src="http://localhost:4173/tremendo-dissolve.js"
        id="tremendo-dissolve"
        data-animation="${dataAnimation}"
      ></script>`,
    )
  }

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
          <div
            ref={animationContainer}
            class="w-full max-w-[360px] items-center justify-center"
          ></div>
          <div class="w-full max-w-[360px] py-4">
            <Slider onChange={setOpacity} value={opacity()} maxValue={1} step={0.001} />
            <Slider onChange={setRadius} value={radius()} maxValue={20} minValue={2} step={0.1} />
            <Slider onChange={setSpeedX} value={speedX()} maxValue={5} minValue={0} step={0.01} />
            <Slider onChange={setSpeedY} value={speedY()} maxValue={5} minValue={0} step={0.01} />
          </div>
          <div class="w-full max-w-[360px] py-1">
            <button
              type="button"
              class="w-full cursor-pointer rounded-sm bg-slate-500 px-4 py-2 transition-colors hover:bg-slate-400 active:bg-slate-300"
              on:click={() => copy()}
            >
              Copy
            </button>
          </div>
        </Match>
      </Switch>
    </div>
  )
}
