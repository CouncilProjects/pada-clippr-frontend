import apiCaller from '$lib/axiosConfig';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
    //make api calls when BE is ready 

    try {
        const {data} = await apiCaller.get("/user/unverified/");
        return {accounts:data}
    } catch (error) {
        return {accounts:[]};
    }

    

}