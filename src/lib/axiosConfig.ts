import  axios,{ AxiosError, type InternalAxiosRequestConfig } from "axios";
import createAuthRefreshInterceptor from "axios-auth-refresh";
const REFRESH_API="token/refresh";

import { loggedUser } from "./universalReactivity/auth.svelte";
const apiCaller = axios.create({
  baseURL: 'http://127.0.0.1:5000/api/',
});

//exported in case we need to manually refresh 
export async function refreshLogic(){
    //assume a call just failed with a 401
    try {
        const refreshResponse = await axios.post(`http://127.0.0.1:5000/api/${REFRESH_API}`);
        const newToken = refreshResponse.data.token;
        if(!newToken){
            return Promise.reject({
                    response:{status:401}
                }); 
        }
        loggedUser.token = newToken;

        apiCaller.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        

        return Promise.resolve(newToken);
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