<script lang="ts">
	import { goto } from "$app/navigation";
	import apiCaller from "$lib/axiosConfig";
    import { type AxiosAuthRefreshRequestConfig } from 'axios-auth-refresh';
    import { loggedUser, logInUser } from "$lib/universalReactivity/auth.svelte";
    import {fade} from 'svelte/transition';
	import axios, { AxiosError } from "axios";
	import { toaster } from "$lib/toast";
    //change as needed
    const LOGINURL="/user/login/";
    const SIGNUPURL="/user/register/";

    let emailEl,userEl,passEl,confEl,firsEl,lastEl;

    //change between login and signup
    let signup=$state(false);
    const onclick=()=>{
        formState={
            username:'',
            password:'',
            firstName:'',
            email:'',
            lastName:'',
            confirm:''
        };

        

        formErrors={
            username:'',
            password:'',
            firstName:'',
            email:'',
            lastName:'',
            confirm:''
        };
        signup=!signup;
    }

    //controll password visibility
    let passwordVisibility=$state(false);

    let formErrors=$state({
        username:'',
        password:'',
        email:'',
        firstName:'',
        lastName:'',
        confirm:''
    })
    let formState=$state({
        username:'',
        firstName:'',
        email:'',
        lastName:'',
        password:'',
        confirm:''
    })

    function formErrorHandler(event:Event){
        const element=event.target as HTMLInputElement;
        const elName = element.name as keyof typeof formErrors;
        
        if(!elName) return;
        if(elName=='confirm'){
            if(formState.confirm!=formState.password){
                formErrors['confirm']="Passwords dont match";
                return;
            }
        }
        formErrors[elName]=element.validity.valid?"":element.validationMessage;
    }

    const invalidAction = $derived(
         (!!formErrors.password || !!formErrors.username || signup&&formErrors.confirm)
        );

    async function loginSubmit(e: Event|null) {
		e?.preventDefault();
        // NOTE stopped at 23-10-2025 and waiting for login route impl

        try {
            console.log("i will try to login");
            const result = await apiCaller.post(LOGINURL,{username:formState.username,password:formState.password},{ skipAuthRefresh: true } as AxiosAuthRefreshRequestConfig );
            const {username,token,role}=result.data;
            logInUser(username,token,role);
            queueMicrotask(()=>{
                goto('/');
            })
        } catch (error) {
            if(axios.isAxiosError(error)){
                if(error.response){
                    if(error.response.status==401){
                        const {detail}=error.response.data;
                        toaster.create({title:"Bad credentials",description:detail,type:'info'});
                        formState.username='';
                        formState.password='';
                    }
                }
            }
        }
	}

    async function signupSubmit(e: Event) {
		e.preventDefault();

        try {
            const result = await apiCaller.post(SIGNUPURL,{username:formState.username,password:formState.password,email:formState.email,first_name:formState.firstName,last_name:formState.lastName});
            if(result.status==201){
                loginSubmit(null);
            }
        } catch (error) {
            if(axios.isAxiosError(error)){
                if(error.response){
                    if(error.response.status==400){
                        const data=error.response.data;
                        const known = Object.keys(formState) as Array<keyof typeof formState>;
                        for(const errorField of Object.keys(data)){
                            if(known.includes(errorField as keyof typeof formState)){
                                const typed = errorField as keyof typeof formState;
                                formState[typed]='';
                                formErrors[typed]=data[typed][0];
                            }
                            else {
                                console.log("Error : "+errorField+" and "+data[errorField][0]);
                            }
                        }
                    }
                }
            }

            return; //failed signup dont proceed
        }
	}
</script>

<div class="flex content-center align-center justify-center px-2 md:p-4">
    <div class="card flex flex-col preset-filled-surface-400-600 p-4 space-y-2 max-w-[70%] lg:max-w-[30%]">
            <h4 class="h4 text-center">{signup?'Signup':'Login'}</h4>
            <form class="space-y-3 md:space-y-5" onsubmit={signup?signupSubmit:loginSubmit}>
                <div class="flex flex-col w-full">
                    <label class="label">
                        <span class="label-text">Username</span>
                        <input
                            class="input {formErrors.username && 'ring-error-500'}"
                            bind:value={formState.username}
                            type='text'
                            name="username"
                            required
                            minlength="4"
                            oninput={formErrorHandler}
                            placeholder="Username"
                        />
                    </label>

                    <p   class="block text-error-800-200 text-xs min-h-5 wrap-break-word whitespace-normal" class:invisible={!formErrors.username}>
                        {formErrors.username}
                    </p>
                </div>

                <div class="flex flex-col w-full">
                    <label class="label">
                        <span class="label-text">Password</span>
                        <input
                            class="input {formErrors.password && 'ring-error-500'}"
                            bind:value={formState.password}
                            type={passwordVisibility ? 'text' : 'password'}
                            name="password"
                            required
                            minlength="8"
                            oninput={formErrorHandler}
                            placeholder="Password"
                        />
                    </label>

                    <p   class="block text-error-800-200 text-xs min-h-5 wrap-break-word whitespace-normal" class:invisible={!formErrors.password}>
                        {formErrors.password}
                    </p>
                </div>

                {#if signup}
                    <div class="flex flex-col w-full">
                        <label class="label">
                            <span class="label-text">Confirm</span>
                            <input
                                class="input {formErrors.confirm && 'ring-error-500'}"
                                bind:value={formState.confirm}
                                type={passwordVisibility ? 'text' : 'password'}
                                name="confirm"
                                required
                                minlength="8"
                                oninput={formErrorHandler}
                                placeholder="Password"
                            />
                        </label>

                        <p   class="block text-error-800-200 text-xs min-h-5 wrap-break-word whitespace-normal" class:invisible={!formErrors.confirm}>
                            {formErrors.confirm}
                        </p>
                    </div>

                    <div class="flex flex-col w-full">
                        <label class="label">
                            <span class="label-text">E-mail</span>
                            <input
                                class="input {formErrors.email && 'ring-error-500'}"
                                bind:value={formState.email}
                                type='email'
                                name="email"
                                required
                                oninput={formErrorHandler}
                                placeholder="Your email"
                            />
                        </label>

                        <p   class="block text-error-800-200 text-xs min-h-5 wrap-break-word whitespace-normal" class:invisible={!formErrors.email}>
                            {formErrors.email}
                        </p>
                    </div>

                    <div class="flex flex-col w-full">
                        <label class="label">
                            <span class="label-text">First name</span>
                            <input
                                class="input {formErrors.firstName && 'ring-error-500'}"
                                bind:value={formState.firstName}
                                type='text'
                                name="fisrtName"
                                required
                                oninput={formErrorHandler}
                                placeholder="Your legal first name"
                            />
                        </label>

                        <p   class="block text-error-800-200 text-xs min-h-5 wrap-break-word whitespace-normal" class:invisible={!formErrors.firstName}>
                            {formErrors.firstName}
                        </p>
                    </div>

                    <div class="flex flex-col w-full">
                        <label class="label">
                            <span class="label-text">Last name</span>
                            <input
                                class="input {formErrors.lastName && 'ring-error-500'}"
                                bind:value={formState.lastName}
                                type='text'
                                name="lastName"
                                required
                                oninput={formErrorHandler}
                                placeholder="Your legal last name"
                            />
                        </label>

                        <p   class="block text-error-800-200 text-xs min-h-5 wrap-break-word whitespace-normal" class:invisible={!formErrors.lastName}>
                            {formErrors.lastName}
                        </p>
                    </div>
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