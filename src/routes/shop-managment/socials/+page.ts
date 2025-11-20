import apiCaller from '$lib/axiosConfig'
import type { PageLoad } from './$types';

export type social = Record<string, string>;

const socials = [
		{ name: 'email'},
		{ name: 'facebook'}, // fallback (Lucide has no Facebook)
		{ name: 'youTube' },
		{ name: 'instagram' },
		{ name: 'whatsApp' }, // closest match
		{ name: 'x' },
		{ name: 'snapchat' }, // closest match
		{ name: 'linkedIn'},
		{ name: 'pinterest'} // closest match
	];

export const load: PageLoad = async () => {
  //15-11-2025 NOTE i wait for mike to make way to support socials. 
  const SOCIALURL = "/user/6/socials/" // to put the get for the urls
  try {
    const filledSocials = await apiCaller.get(SOCIALURL);
    console.log(filledSocials.data.socials);
    
    if(filledSocials.data.socials.length==0) return {socials:{}}

    let returnedData:social = {}

    filledSocials.data.socials.forEach((social:social)=>{
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
