import type { paths } from '$lib/api-types';
import apiCaller from '$lib/axiosConfig';
import type { PageLoad } from './$types';

type unverifiedResponse = paths['/api/user/unverified/']['get']['responses']['200']['content']['application/json']
export const load: PageLoad = async () => {
    //make api calls when BE is ready 

    try {
        const {data} = await apiCaller.get<unverifiedResponse>("/user/unverified/");
        return {accounts:data}
    } catch (error) {
        return {accounts:[]};
    }

    

}