import { PolymorphicProps } from "@kobalte/core"
import { Slider as SliderPrimitive, SliderRootProps } from "@kobalte/core/slider"
import { ValidComponent } from "solid-js"

type SliderProps<T extends ValidComponent> = PolymorphicProps<T, SliderRootProps<T>>

export function Slider<T extends ValidComponent>(props: SliderProps<T>) {
  return (
    <div class="w-full py-2">
      <SliderPrimitive {...props} class="relative">
        <SliderPrimitive.Track class="h-3 w-full bg-stone-600">
          <SliderPrimitive.Fill class="absolute h-full bg-stone-400" />
          <SliderPrimitive.Thumb class="-top-0.5 h-4 w-4 cursor-pointer rounded-full bg-slate-500 transition-colors hover:bg-slate-400">
            <SliderPrimitive.Input />
          </SliderPrimitive.Thumb>
        </SliderPrimitive.Track>
        <SliderPrimitive.Description />
        <SliderPrimitive.ErrorMessage />
      </SliderPrimitive>
    </div>
  )
}
