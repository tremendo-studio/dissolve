class TremendoDissolve extends HTMLElement {
  connectedCallback() {
    this.
  }
}

function main() {
  customElements.define("tremendo-dissolve", TremendoDissolve)
}

if (document.readyState === "complete") {
  main()
} else {
  document.addEventListener("DOMContentLoaded", main)
}
