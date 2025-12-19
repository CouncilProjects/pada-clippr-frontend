import { refreshLogic } from "$lib/axiosConfig";

export const ssr=false;

import { locales } from '../locales/data.js'
import { browser } from '$app/environment'
import { loadLocale } from 'wuchale/load-utils'
// so that the loaders are registered, only here, not required in nested ones (below)
import '../locales/main.loader.svelte.js'
import '../locales/js.loader.js'

/** @type {import('./$types').LayoutLoad} */
export const load = async () => {
    if(!browser) return;
    const locale = localStorage.getItem("clippr-locale") || 'en';
    if (browser && locales.includes(locale)) {
        await loadLocale(locale)
    } else {
        console.error(`Cant find ${locale.length} in ${locales}`);
    }
}

refreshLogic();