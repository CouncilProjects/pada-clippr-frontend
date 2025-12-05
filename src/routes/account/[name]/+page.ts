

import apiCaller from '$lib/axiosConfig';
import axios, { Axios, AxiosError, isAxiosError, type AxiosResponse } from 'axios';
import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageLoad =async  ({params})=>{
    const resp={};
    let items:AxiosResponse;
    let socials:AxiosResponse|null=null;
    try {

        /*items =await apiCaller.get("/items/search");
        if(items.status==200){
            if(items.data.verified==true){
                socials =await apiCaller.get(`user/socials/${params.name}`);
            }
        }*/
       const testItems = [
  {
    title: "Vintage Backpack",
    neg: false,
    price: 79.99,
    stock: 12,
    thumbnail: "https://picsum.photos/200/200?random=1",
    fromVerified: true
  },
  {
    title: "Retro Sunglasses",
    neg: false,
    price: 29.99,
    stock: 25,
    thumbnail: "https://picsum.photos/200/200?random=2",
    fromVerified: false
  },
  {
    title: "Leather Wallet",
    neg: false,
    price: 45.0,
    stock: 8,
    thumbnail: "https://picsum.photos/200/200?random=3",
    fromVerified: false
  },
  {
    title: "Casual Sneakers",
    neg: false,
    price: 59.5,
    stock: 20,
    thumbnail: "https://picsum.photos/200/200?random=4",
    fromVerified: true
  },
  {
    title: "Graphic T-Shirt",
    neg: true,
    price: 19.99,
    stock: 50,
    thumbnail: "https://picsum.photos/200/200?random=5",
    fromVerified: false
  },
  {
    title: "Jeans Slim Fit",
    neg: false,
    price: 39.99,
    stock: 15,
    thumbnail: "https://picsum.photos/200/200?random=6",
    fromVerified: false
  },
  {
    title: "Classic Watch",
    neg: false,
    price: 129.99,
    stock: 5,
    thumbnail: "https://picsum.photos/200/200?random=7",
    fromVerified: true
  },
  {
    title: "Beanie Hat",
    neg: true,
    price: 14.99,
    stock: 30,
    thumbnail: "https://picsum.photos/200/200?random=8",
    fromVerified: false
  },
  {
    title: "Wireless Earbuds",
    neg: false,
    price: 89.99,
    stock: 18,
    thumbnail: "https://picsum.photos/200/200?random=9",
    fromVerified: false
  }
];
       socials =await apiCaller.get(`user/socials/${params.name}`);
       console.log(socials?.data.socials);
        return {paramName:params.name,items:testItems,isVer:true,shopSocials:socials?.data.socials}
    } catch (err) {
        console.error(err+"");
        if(axios.isAxiosError(err)){
            if(!err.response){
                console.error('netowrk problem');
            }
            error(404,'Not found');
        }
    }
}