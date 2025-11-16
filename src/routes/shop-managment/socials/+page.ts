import apiCaller from '$lib/axiosConfig'
import type { PageLoad } from './$types';

export type social = Record<string, string>;


export const load: PageLoad = async () => {
  //15-11-2025 NOTE i wait for mike to make way to support socials. 
  const SOCIALURL = "#" // to put the get for the urls
  try {
    //const filledSocials = await apiCaller.get(SOCIALURL);

    //const socialData = filledSocials.data;

    const socialDataFake = {
      "socials": [
        {
          "name": "instagram",
          "account": "https://instagram.com/myshop"
        },
        {
          "name": "x",
          "account": "https://twitter.com/myshop"
        },
        {
          "name": "facebook",
          "account": "https://facebook.com/myshop"
        }
      ]
    }

    if(socialDataFake.socials.length==0) return {socials:{}}

    let returnedData:social = {}

    socialDataFake.socials.forEach((social)=>{
      returnedData[social.name]=social.account
    })

    return { socials: returnedData }
  } catch (error) {

  }
}
