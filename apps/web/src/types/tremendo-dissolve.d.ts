import { JSX } from "solid-js"

declare module "solid-js" {
  namespace JSX {
    interface IntrinsicElements {
      "tremendo-dissolve": any
    }
  }
}
