import apiCaller from '$lib/axiosConfig';
import type { PageLoad } from './$types';


export const load: PageLoad = async () => {

    try {
        const results = await apiCaller.get('/item/my-clippings/');
        return{items:results.data.items};
    }catch (err) {
    console.error(err);
    return { items: [] }; // fallback to empty array
    }
}

  