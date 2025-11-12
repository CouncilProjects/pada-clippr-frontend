<script lang='ts'>
	import apiCaller from '$lib/axiosConfig';
	import { toaster } from '$lib/toast';
	import { loggedUser } from '$lib/universalReactivity/auth.svelte';
	import { FileIcon } from '@lucide/svelte';
	import { FileUpload } from '@skeletonlabs/skeleton-svelte';

    let avatarChosen = $state<Blob|null>(null);

    const onFileAccept = (event:any) => {
    // The event contains acceptedFiles array
    const { files } = event;
    
    if (files && files.length > 0) {
        const file = files[0]; // Get first accepted file
        
        // Validate the file
        if (!file.type.startsWith('image/')) {
            toaster.create({type:'error',description:'Please select an image file (JPEG, PNG, WEBP, etc.)'})
            return;
        }
        
        // Check file size (e.g., 5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            
            toaster.create({type:'error',description:'File size must be less than 5MB'})
            return;
        }
        
        // Handle the file upload
        avatarChosen=file;
    } else {
        avatarChosen=null;
    }


};

const uploadAvatar = async ()=>{
    if(avatarChosen==null) return;
    console.log("called");
    const formData = new FormData;
    formData.append('image',avatarChosen);
    try {
        const result = await apiCaller.post("user/avatar/",formData,{headers: {'Content-Type': 'multipart/form-data'}});
        const result2 = await apiCaller.get("user/avatar/");
        
      if(result2.status==200){
        const {userAvatar} = result2.data;
        if(userAvatar.length>0){
            console.log(userAvatar[0].image);
          loggedUser.avatar=userAvatar[0].image;
        }
        avatarChosen=null;
      }
    } catch (error) {
        console.error(error+'');
        
    }
}

const delAvatar = async ()=>{
    try {
        const result = await apiCaller.delete("user/avatar/");
        
      if(result.status==200){
        const {userAvatar} = result.data;
        loggedUser.avatar=null
        avatarChosen=null;
      }
    } catch (error) {
        console.error(error+'');
        
    }
}

</script>

<div>
	<div class="card preset-filled-surface-300-700 text-center items-center">
		<h3 class="h3">Todo</h3>
		<div class="card preset-filled-surface-200-800 flex flex-col justify-center items-center">
			<h5>Avatar</h5>
			<p>Upload or change your avatar</p>
			<FileUpload class="w-fit" {onFileAccept} onFileReject={()=>console.log("hoooo")}>
				<FileUpload.Trigger>Browse Files <FileIcon></FileIcon></FileUpload.Trigger>
				<FileUpload.HiddenInput />
				<FileUpload.ItemGroup>
					<FileUpload.Context>
						{#snippet children(fileUpload)}
							{#each fileUpload().acceptedFiles as file (file.name)}
								<FileUpload.Item {file}>
									<FileUpload.ItemName>{file.name}</FileUpload.ItemName>
									<FileUpload.ItemSizeText>{file.size} bytes</FileUpload.ItemSizeText>
									<FileUpload.ItemDeleteTrigger />
								</FileUpload.Item>
							{/each}
						{/snippet}
					</FileUpload.Context>
				</FileUpload.ItemGroup>
			</FileUpload>

            {#if avatarChosen}
                <button class="btn preset-filled-primary-50-950" onclick={uploadAvatar}>Confirm</button>
            {:else}
                <button class="btn preset-filled-secondary-50-950" disabled={!loggedUser.avatar} onclick={delAvatar}>Delete Avatar</button>
            {/if}
		</div>
	</div>
</div>
