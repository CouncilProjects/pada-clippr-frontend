import { MediaQuery } from "svelte/reactivity";

export const sm = new MediaQuery("(min-width: 640px)");
export const md = new MediaQuery("(min-width: 768px)");
export const lg = new MediaQuery("(min-width: 1024px)");
export const xl = new MediaQuery("(min-width: 1280px)");
