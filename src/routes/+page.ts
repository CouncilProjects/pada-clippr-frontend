import {loggedUser} from "$lib/universalReactivity/auth.svelte"
import { type paths } from "$lib/api-types"
import apiCaller, { refreshLogic } from "$lib/axiosConfig";
import { goto } from "$app/navigation";

export async function  load() {
    type routetype = paths["/api/item/home/feed/"]['get']['responses']['200']['content']['application/json'];
    if(loggedUser.token==null){
        await refreshLogic();
    }

    if (loggedUser.accountType =="MEMBER"){
        let searchesRet = localStorage.getItem(`clippr-${loggedUser.id}-latest-searches`);
        let query: paths["/api/item/home/feed/"]["get"]["parameters"]["query"] 

        if(searchesRet!=null){
            query = {search: await JSON.parse(searchesRet) }
        } else { query = {} }

        query.amount = 20;

        const feed = await apiCaller.get<routetype>("item/home/feed/",{params:query,paramsSerializer:{indexes:null}});
        console.table(feed.data.results);
        return { feed: feed.data.results }
    }



}
