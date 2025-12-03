
<script lang="ts">
    const fallback = "https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg";
    type props={
        title:string,price:number,neg:boolean,stock:number,thumbnail?:string,downsized?:number
    }
    let {title,price,neg,stock,thumbnail=fallback,downsized}:props = $props()
    console.log(downsized);
</script>

<div class="cursor-pointer m-2 card preset-filled-surface-300-700 hover:preset-filled-primary-500 hover:-translate-y-2 md:hover:-translate-y-5 " style={`max-width:${downsized || 100}%`}>
    
    <div class="flex flex-col items-center p-2 h-full">
        <img src={thumbnail} onerror={(e)=>{(e.currentTarget as HTMLImageElement).src=fallback}} alt="Thumbnail"/>
        
        <table class="table text-center mt-auto ">
            <tbody>
                <tr>
                    <td>
                        <span>{title}</span>
                    </td>
                    <td>
                        <span>{price} $</span>
                    </td>
                </tr>
                <tr>
                    <td>
                        {#if neg}
                            <span class="text-green-600">Negotiable</span>
                        {:else}
                            <span class="text-red-400">Non negotiable</span>
                        {/if}
                    </td>
                    <td>
                        <span>Stock left: {stock}</span>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</div>