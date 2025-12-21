import apiCaller from "$lib/axiosConfig";

export let locale = $state({value:localStorage.getItem("clippr-locale") || 'en'});

export const getLocale = () => {
    return locale.value;
}

export const toogleLocale = ()=>{
    if(locale.value=='en'){
        locale.value='gr';
    } else {
        locale.value='en';
    }
}

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
}

export const logoutUser = () => {
    loggedUser.id = null;
    loggedUser.username = null;
    loggedUser.token = null;
    loggedUser.accountType = null;
    loggedUser.avatar=null;
}