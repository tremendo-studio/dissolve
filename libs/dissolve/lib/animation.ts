export type Pixel = {
  x: number
  y: number
  r: number
  g: number
  b: number
  a: number
}

export type AnimationData = {
  width: number
  height: number
  pixels: Pixel[]
  speedX: number
  speedY: number
  opacity: number
  radius: number
}

export function createAnimation(container: HTMLElement, data: AnimationData) {
  let { pixels, ...rest } = data

  let containerWidth = container.offsetWidth
  let scale = containerWidth / rest.width
  let radiusValue = rest.radius * scale
  let maxOffset = 5 * scale

  let canvas = container.childNodes[0]
    ? (container.childNodes[0] as HTMLCanvasElement)
    : document.createElement("canvas")

  canvas.width = rest.width * scale
  canvas.height = rest.height * scale

  container.appendChild(canvas)

  let points = pixels.map((pixel) => ({
    ...pixel,
    color: `rgba(${pixel.r}, ${pixel.g}, ${pixel.b}, ${
      Math.random() > rest.opacity ? 0 : pixel.a
    })`,
    offsetX: Math.random() * 2 - 1,
    offsetY: Math.random() * 2 - 1,
    speedX: (Math.random() - 0.5) * rest.speedX,
    speedY: (Math.random() - 0.5) * rest.speedY,
    scaledX: pixel.x * scale,
    scaledY: pixel.y * scale,
  }))

  let loop = () => {
    frame = requestAnimationFrame(loop)
    let ctx = canvas.getContext("2d")!

    ctx.clearRect(0, 0, canvas.width, canvas.height)

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
        Math.PI * 2
      )

      ctx.fill()
    }
  }

  let frame = requestAnimationFrame(loop)
  return () => cancelAnimationFrame(frame)
}
