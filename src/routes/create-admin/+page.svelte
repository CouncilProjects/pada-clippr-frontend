<script lang="ts">
	import { goto } from "$app/navigation";
	import apiCaller from "$lib/axiosConfig";
	import axios, { AxiosError } from "axios";
	import { toaster } from "$lib/toast";
    import type { paths } from "$lib/api-types";
    const SIGNUPURL="/user/register/";

    const onclick=()=>{
        formState={
            username:'',
            password:'',
            email:'',
            legalName:'',
            confirm:''
        };

        formErrors={
            username:'',
            password:'',
            email:'',
            legalName:'',
            confirm:''
        };
    }

    //controll password visibility
    let passwordVisibility=$state(false);

    let formErrors=$state({
        username:'',
        password:'',
        email:'',
        confirm:'',
        legalName:''
    })
    let formState=$state({
        username:'',
 
        email:'',
 
        password:'',
        confirm:'',
        legalName:''
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

        if(elName=='legalName'){
            const parts = formState.legalName.split('-');

            if(parts.length<2 || parts[0].length==0 || parts[1].length==0){
                formErrors['legalName']="Use format first-last name";
                return;
            }
        }

        formErrors[elName]=element.validity.valid?"":element.validationMessage.split('(')[0];
    }

    const invalidAction = $derived(
         (!!formErrors.password || !!formErrors.username || formErrors.confirm || formErrors.legalName)
	);

    async function signupSubmit(e: Event) {
        e.preventDefault();
        const body : paths['/api/user/register/']['post']['requestBody']['content']['application/json'] = 
            {email:formState.email,
                first_name:formState.legalName.split('-')[0],
                last_name:formState.legalName.split('-')[1],
                username:formState.username,
                password:formState.password,
				is_staff: true, is_superuser: true
			};
        try {
            const result = await apiCaller.post(SIGNUPURL,body);
			if(result.status == 201) {
				goto('/');
				toaster.info({title: "New admin account has been created.", duration: 1500})
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

            return;
        }
	}
</script>

<div class="flex content-center align-center justify-center px-2 md:p-4">
    <div class="card flex flex-col preset-filled-surface-400-600 p-4 space-y-2 max-w-[70%] lg:max-w-[max(30%,400px)]">
            <h4 class="h4 text-center">Create New Admin</h4>
            <form class="space-y-3 md:space-y-5" onsubmit={signupSubmit}>
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

                    <p   class="text-error-800-200 text-xs min-h-5 wrap-break-word whitespace-normal" class:invisible={!formErrors.username}>
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

                    <p   class="text-error-800-200 text-xs min-h-5 wrap-break-word whitespace-normal" class:invisible={!formErrors.password}>
                        {formErrors.password}
                    </p>
                </div>

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

					<p   class="text-error-800-200 text-xs min-h-5 wrap-break-word whitespace-normal" class:invisible={!formErrors.confirm}>
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

					<p   class="text-error-800-200 text-xs min-h-5 wrap-break-word whitespace-normal" class:invisible={!formErrors.email}>
						{formErrors.email}
					</p>
				</div>

				<div class="flex flex-col w-full">
					<label class="label">
						<span class="label-text">First name-Last name</span>
						<input
							class="input {formErrors.legalName && 'ring-error-500'}"
							bind:value={formState.legalName}
							type='text'
							name="legalName"
							required
							oninput={formErrorHandler}
							placeholder="Your full legal name"
						/>
					</label>

					<p   class="text-error-800-200 text-xs min-h-5 wrap-break-word whitespace-normal" class:invisible={!formErrors.legalName}>
						{formErrors.legalName}
					</p>
				</div>

                <label class="flex items-center space-x-2 md:m-2">
                    <input class="checkbox" bind:checked={passwordVisibility} type="checkbox" />
                    <p>Show password</p>
                </label>

                <button type="submit" class="btn preset-filled-primary-500 w-full" disabled={invalidAction}>Create</button>
            </form>
        </div>
</div>
