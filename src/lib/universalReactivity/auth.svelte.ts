import apiCaller from "$lib/axiosConfig";


interface loggedUserInfo{
    username:string|null,
    token:string|null,
    accountType:string|null
    avatar:string|null
}


export const loggedUser = $state<loggedUserInfo>({
    username:null,
    token:null,
    accountType:null,
    avatar:null
})

export const getAccessToken=()=>{
    return loggedUser.token;
}

export const logInUser=(name:string,token:string,type:string)=>{
    loggedUser.username=name;
    loggedUser.token=token;
    loggedUser.accountType=type;
    apiCaller.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}