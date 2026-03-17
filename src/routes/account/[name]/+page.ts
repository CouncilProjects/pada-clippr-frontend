import apiCaller from '$lib/axiosConfig';
import axios, { Axios, AxiosError, isAxiosError, type AxiosResponse } from 'axios';
import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';
import { type paths } from '$lib/api-types';

type userResponse = paths['/api/user/by_username/{username}/']['get']['responses']['200']['content']['application/json'];
type socialResponse = paths['/api/user/{id}/socials/']['get']['responses']['200']['content']['application/json'];
type reviewResponse = paths['/api/review/account/{username}/']['get']['responses']['200']['content']['application/json'];

export const load: PageLoad = async ({params}) => {
    try {
        const reviewsPromise = apiCaller.get<reviewResponse>(`review/account/${params.name}`);
        const id_req = await apiCaller.get<userResponse>(`user/by_username/${params.name}`);
        const user_id = id_req?.data.id;
        const socials_req = await apiCaller.get<socialResponse>(`user/${user_id}/socials/`);
        

        return {
            userID: user_id,
            paramName: params.name,
            isVer: socials_req?.data.glint,
            shopSocials: socials_req?.data.socials,
            reviewsPromise : reviewsPromise
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
