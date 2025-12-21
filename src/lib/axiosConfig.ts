import  axios,{ AxiosError, type InternalAxiosRequestConfig } from "axios";
import createAuthRefreshInterceptor from "axios-auth-refresh";
const REFRESH_API="user/refresh/";

import { loggedUser, logInUser } from "./universalReactivity/auth.svelte";

axios.defaults.withCredentials=true;

export const backend="http://127.0.0.1:8000"

const apiCaller = axios.create({
  baseURL: backend+'/api/',
});

apiCaller.interceptors.request.use((config)=>{
    const token = loggedUser.token;

    if(token){
        config.headers.Authorization = `Bearer ${token}`;
    } else {
        if (config.headers && 'Authorization' in config.headers){
            delete config.headers.Authorization; //remove stale.
        }
    }

    return config;
})
//exported in case we need to manually refresh 
export async function refreshLogic(){
    //assume a call just failed with a 401
    try {
        const refreshResponse = await axios.get(`http://127.0.0.1:8000/api/${REFRESH_API}`);
        const {id,token,username,role} = refreshResponse.data;
        console.log(id+" and "+token+" and "+username+" and +"+role);
        if(!token){
            return Promise.reject({
                    response:{status:401}
                }); 
        }

        logInUser(id,username,token,role);
        

        return Promise.resolve(token);
    } catch (error) {
        return Promise.reject();
    }
}

async function refreshAndRetry(failedRequest:AxiosError) {
    try {
        const newtoken = await refreshLogic();
        if(failedRequest.response?.config){
            failedRequest.response.config.headers['Authorization'] = `Bearer ${newtoken}`;
        }

        return Promise.resolve();
    } catch (error) {
        return Promise.reject({
                    response:{status:401}
                }); 
    }
}

createAuthRefreshInterceptor(apiCaller,refreshAndRetry,{
    statusCodes:[401],
    pauseInstanceWhileRefreshing:true
});



export default apiCaller;