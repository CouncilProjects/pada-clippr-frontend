import apiCaller from "$lib/axiosConfig";


interface loggedUserInfo{
    id:number|null,
    username:string|null,
    token:string|null,
    accountType:string|null
    avatar:string|null
}


export const loggedUser = $state<loggedUserInfo>({
    id:null,
    username:null,
    token:null,
    accountType:null,
    avatar:null
})

export const getAccessToken=()=>{
    return loggedUser.token;
}

export const logInUser=(id:number,name:string,token:string,type:string)=>{
    loggedUser.id=id;
    loggedUser.username=name;
    loggedUser.token=token;
    loggedUser.accountType=type;
    apiCaller.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}