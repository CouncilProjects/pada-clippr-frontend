import apiCaller, { refreshLogic } from '$lib/axiosConfig';
import type { PageLoad } from './$types';
import { type schemas } from '$lib';

export const load: PageLoad = async () => {
    try {

        const results = await apiCaller.get('/item/my-clippings/');
        return { items: results.data.items as schemas['ItemBasic'][] };
    } catch (err) {
        console.error(err);
        return { items: [] }; // fallback to empty array
    }
};

  