import apiCaller from '$lib/axiosConfig';
import axios, { Axios, AxiosError, isAxiosError, type AxiosResponse } from 'axios';
import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({params}) => {
    try {
        const id_req = await apiCaller.get(`user/by_username/${params.name}`);
        const user_id = id_req?.data.id;

        const socials_req = await apiCaller.get(`user/${user_id}/socials/`);

        const items_req = await apiCaller.get("/item/", { params: {
            u: encodeURIComponent(user_id)
        }})

        return {
            isVer: true,
            paramName: params.name,
            items: items_req?.data.results,
            shopSocials: socials_req?.data.socials
        }
    } catch (err) {
        console.error(err+"");
        if(axios.isAxiosError(err)){
            if(!err.response){
                console.error('netowrk problem');
            }
            error(404,'Not found');
        }
    }
}
