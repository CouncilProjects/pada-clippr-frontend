import apiCaller from '$lib/axiosConfig'
import type { PageLoad } from './$types';

import { loggedUser } from '$lib/universalReactivity/auth.svelte';
import type { paths } from '$lib/api-types';
import {type schemas} from "$lib"

export type social = Record<schemas['PlatformEnum'], schemas['SocialLink']['url']>;

const socials:Record<"name",schemas['PlatformEnum']>[] = [
		{ name: 'email'},
		{ name: 'facebook'}, // fallback (Lucide has no Facebook)
		{ name: 'youtube' },
		{ name: 'instagram' },
		{ name: 'whatsapp' }, // closest match
		{ name: 'twitter' },
		{ name: 'snapchat' }, // closest match
		{ name: 'linkedin'},
		{ name: 'pinterest'} // closest match
	];

type socialResponse = paths['/api/user/{id}/socials/']['get']['responses']['200']['content']['application/json']

export const load: PageLoad = async () => {
  //15-11-2025 NOTE i wait for mike to make way to support socials. 
  const SOCIALURL = `/user/${loggedUser.id}/socials/` // to put the get for the urls
  try {
    const filledSocials = await apiCaller.get<socialResponse>(SOCIALURL);
    console.log(filledSocials.data.socials);
    
    if(filledSocials.data.socials.length==0) return {socials:{}}

    let returnedData:social = {} as social;

    filledSocials.data.socials.forEach((social)=>{
      returnedData[social.platform]=social.url
    })

    socials.forEach((social)=>{
      if(!returnedData[social.name]){
        returnedData[social.name]=''
      }
    })



    return { socials: returnedData }
  } catch (error) {
    return { socials: {} }
  }
}
