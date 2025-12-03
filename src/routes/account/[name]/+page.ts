

import apiCaller from '$lib/axiosConfig';
import axios, { Axios, AxiosError, isAxiosError, type AxiosResponse } from 'axios';
import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageLoad =async  ({params})=>{
    const resp={};
    let items:AxiosResponse;
    let socials:AxiosResponse|null=null;
    try {

        /*items =await apiCaller.get("/items/search");
        if(items.status==200){
            if(items.data.verified==true){
                socials =await apiCaller.get(`user/socials/${params.name}`);
            }
        }*/
       socials =await apiCaller.get(`user/socials/${params.name}`);
       console.log(socials?.data.socials);
        return {paramName:params.name,items:[],isVer:true,shopSocials:socials?.data.socials}
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