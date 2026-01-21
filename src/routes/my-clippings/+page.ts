import apiCaller from '$lib/axiosConfig';
import type { PageLoad } from './$types';
import { type schemas } from '$lib';
import { type paths } from '$lib/api-types';
import axios from 'axios';



export const load: PageLoad = async () => {

    try {
        const results = await apiCaller.get('/item/my-clippings/');
        return { items: results.data.items as schemas['ItemBasic'][] };
    }catch (err) {
    console.error(err);
    return { items: [] }; // fallback to empty array
    }
}

  