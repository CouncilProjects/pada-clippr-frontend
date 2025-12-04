export type ItemThumbnail={
    title:string,
    neg:boolean,
    price:number,
    stock:number,
    thumbnail?:string|undefined, //malformed or missing thumbnails are replaced.
    downsized?:number // most likely not needed, controls the max % for width per item (Not useful if used through the ThumbnailList)
    fromVerified?:boolean // If the item is provided by a verified seller.
}