<script lang="ts">
	import { goto } from "$app/navigation";
	import apiCaller from "$lib/axiosConfig";
    import { loggedUser, logInUser } from "$lib/universalReactivity/auth.svelte";

    //change as needed
    const LOGINURL="login";
    const SIGNUPURL="signup";

    //change between login and signup
    let signup=$state(false);
    const onclick=()=>{
        formState={
            username:'',
            password:'',
            confirm:''
        };
        formErrors={
            username:'',
            password:'',
            confirm:''
        };
        signup=!signup;
    }

    //controll password visibility
    let passwordVisibility=$state(false);

    let formErrors=$state({
        username:'',
        password:'',
        confirm:''
    })
    let formState=$state({
        username:'',
        password:'',
        confirm:''
    })

    const invalidAction = $derived(
         (!!formErrors.password || !!formErrors.username || signup&&formErrors.confirm)
        );

    $effect(()=>{
        
        if (formState.username.trim().length < 4) {
            formErrors.username = "Username should be 4 characters at least";
        } else {
            formErrors.username = '';
        }
    })

    $effect(()=>{
        if (formState.password.trim().length < 8) {
            formErrors.password = "Password should be 8 characters at least";
        } else {
            formErrors.password = '';
        }
        
        if(formState.password!==formState.confirm){
            formErrors.confirm = "Please confirm your password";
        } else {
            formErrors.confirm = '';
        }
    })
    

    async function loginSubmit(e: Event) {
		e.preventDefault();
        logInUser("fake","fakeToken","fakeRole");
        localStorage.setItem('lastLogin',new Date().toLocaleString("el-GR"));
        
        goto('/');
        return;
        // NOTE stopped at 23-10-2025 and waiting for login route impl

        try {
            const result = await apiCaller.post(LOGINURL,{username:formState.username,password:formState.password});
            const {user,token,role}=result.data;
            logInUser(user,token,role);
            goto('/');
        } catch (error) {
            // TODO i wait for the backend to see how the errors look like
        }
	}

    async function signupSubmit(e: Event) {
		e.preventDefault();
        // NOTE stopped at 23-10-2025 and waiting for signup route impl
        return;

        try {
            const result = await apiCaller.post(SIGNUPURL,{username:formState.username,password:formState.password});
        } catch (error) {
            // TODO i wait for the backend to see how the errors look like

            return; //failed signup dont proceed
        }
        //assume good signup
        try {
            const result = await apiCaller.post(LOGINURL,{username:formState.username,password:formState.password});
            const {user,token,role}=result.data;
            logInUser(user,token,role);
            goto('/');
        } catch (error) {
            // TODO i wait for the backend to see how the errors look like
        }
	}
</script>

<div class="flex content-center align-center justify-center px-2 md:p-4">
    <div class="card flex flex-col preset-filled-surface-400-600 p-4 space-y-2">
            <h4 class="h4 text-center">{signup?'Signup':'Login'}</h4>
            <form class="space-y-4 md:space-y-8" onsubmit={signup?signupSubmit:loginSubmit}>
                <label class="label">
                    <span class="label-text">Username</span>
                    <input class="input {formErrors.username&&'ring-error-500'}" 
                        bind:value={formState.username} 
                        type="text" 
                        placeholder="Username"/>
                    {#if formErrors.username}
                        <p class="text-error-800-200 text-xs">{formErrors.username}</p>
                    {/if}
                </label>

                <label class="label">
                    <span class="label-text">Password</span>
                    <input class="input {formErrors.password&&'ring-error-500'}" 
                        bind:value={formState.password} 
                        type={passwordVisibility?'text':'password'} 
                        placeholder="Password"/>
                    {#if formErrors.password}
                        <p class="text-error-800-200 text-xs">{formErrors.password}</p>
                    {/if}
                </label>

                {#if signup}
                    <label class="label">
                        <span class="label-text">Password</span>
                        <input class="input {formErrors.confirm&&'ring-error-500'}" 
                            bind:value={formState.confirm} 
                            type={passwordVisibility?'text':'password'} 
                            placeholder="Confirm Password"/>
                        {#if formErrors.confirm}
                            <p class="text-error-800-200 text-xs">{formErrors.confirm}</p>
                        {/if}
                    </label>
                {/if}

                

                <label class="flex items-center space-x-2 md:m-2">
                    <input class="checkbox" bind:checked={passwordVisibility} type="checkbox" />
                    <p>Show password</p>
                </label>

                <button type="submit" class="btn preset-filled-primary-500 w-full" disabled={invalidAction}>{signup?'Signup':'Login'}</button>
            </form>
            
            <button class="anchor cursor-pointer text-center" {onclick}>{signup?'Already have an account ?': 'Dont have an account ?'}</button>
        </div>
</div>