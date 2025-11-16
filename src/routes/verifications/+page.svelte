<script lang="ts">
	import apiCaller from '$lib/axiosConfig';
    import type { PageProps } from './$types';

    let {data}:PageProps = $props();
    let clone = $state(data.accounts);

    async function submitVerify(e:Event,id:any){
        try {
            const {data} = await apiCaller.post(`/user/${id}/verify/`);
            clone = clone.filter((elem:any)=>elem.id!=id);
        } catch (error) {
            console.log("I am not payed: verifications:page.svelte");
        }
    }

</script>


<div>
    <div class="table-wrapper">
        <table class="table">
            <thead>
                <tr>
                    <th>Shop</th>
                    <th>First name</th>
                    <th>Last name</th>
                    <th>Verify</th>
                </tr>
            </thead>
            <tbody class="[&>tr]:hover:bg-primary-400/20">
                {#each clone as row}
                    <tr>
                        <td>{row.username}</td>
                        <td>{row.first_name}</td>
                        <td>{row.last_name}</td>
                        <td><button class="btn preset-outlined-secondary-400-600 hover:preset-tonal-secondary" onclick={(e)=>{submitVerify(e,row.id);}}>Verify</button></td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</div>