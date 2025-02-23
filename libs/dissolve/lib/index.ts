import { createAnimation } from "./animation"

function main() {
  let script = document.getElementById("tremendo-dissolve")!

  let unparsedData = script.getAttribute("data-animation")
  let animationData = JSON.parse(atob(unparsedData!))

  let container = document.getElementById("animation-container")
  if (!container) return

  let clean: ReturnType<typeof createAnimation>

  let resizeObserver = new ResizeObserver(() => {
    clean?.()
    clean = createAnimation(container, animationData)
  })

  resizeObserver.observe(container)

  let observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.removedNodes.forEach((node) => {
        if (node !== container) return
        clean()
        observer.disconnect()
      })
    })
  })

  observer.observe(document.body, { childList: true, subtree: true })
}

if (document.readyState === "complete") {
  main()
} else {
  document.addEventListener("DOMContentLoaded", main)
}
