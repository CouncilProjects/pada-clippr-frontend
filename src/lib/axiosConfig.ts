import  axios,{ AxiosError, type InternalAxiosRequestConfig } from "axios";
import createAuthRefreshInterceptor from "axios-auth-refresh";
const REFRESH_API="user/refresh/";

import { loggedUser } from "./universalReactivity/auth.svelte";

axios.defaults.withCredentials=true;

export const backend="http://127.0.0.1:8000"

const apiCaller = axios.create({
  baseURL: backend+'/api/',
});

//exported in case we need to manually refresh 
export async function refreshLogic(){
    //assume a call just failed with a 401
    try {
        const refreshResponse = await axios.get(`http://127.0.0.1:8000/api/${REFRESH_API}`);
        const {token,username,role} = refreshResponse.data;
        console.log(token+" and "+username+" and +"+role);
        if(!token){
            return Promise.reject({
                    response:{status:401}
                }); 
        }
        loggedUser.token = token;
        loggedUser.accountType=role;
        loggedUser.username=username;
        apiCaller.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        

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