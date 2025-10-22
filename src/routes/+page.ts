import {loggedUser} from "$lib/universalReactivity/auth.svelte"

export async function  load() {
    //stop the data fetching
   if(loggedUser.username==null){
            return {};        
    }

    const thing = await fetch('https://dummyjson.com/products');

}
