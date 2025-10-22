

interface loggedUserInfo{
    username:string|null,
    token:string|null,
    accountType:string|null
}


export const loggedUser = $state<loggedUserInfo>({
    username:null,
    token:null,
    accountType:null
})