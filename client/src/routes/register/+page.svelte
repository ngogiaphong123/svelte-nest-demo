<script lang="ts">
	let email: string;
	let fullName: string;
	let password: string;
	let passwordConfirm: string;
	let avatar: File;

	const handleImageUpload = (e: Event) => {
		const target = e.target as HTMLInputElement;
		const file: File = (target.files as FileList)[0];
		avatar = file;
	};

	const handleRegister = async (e: Event) => {
		const formData = new FormData();
		formData.append('email', email);
		formData.append('fullName', fullName);
		formData.append('password', password);
		formData.append('passwordConfirm', passwordConfirm);
		formData.append('avatar', avatar);
		console.log(email, fullName, password, passwordConfirm, avatar)
		// Call the API
	};
</script>

<div class="container-fluid w-25 h-100 mt-3">
	<form
		method="POST"
		enctype="multipart/form-data"
		on:submit|preventDefault|stopPropagation={handleRegister}
	>
		<div class="form-group mb-3">
			<label for="email">Email address</label>
			<input
				bind:value={email}
				type="email"
				class="form-control"
				id="email"
				placeholder="Enter email"
			/>
		</div>
		<div class="form-group mb-3">
			<label for="fullName">Full name</label>
			<input
				type="text"
				class="form-control"
				id="fullName"
				placeholder="Password"
				bind:value={fullName}
			/>
		</div>
		<div class="form-group mb-3">
			<label for="password">Password</label>
			<input
				bind:value={password}
				type="password"
				class="form-control"
				id="password"
				placeholder="Password"
			/>
		</div>
		<div class="form-group mb-3">
			<label for="passwordConfirm">Confirm password</label>
			<input
				bind:value={passwordConfirm}
				type="password"
				class="form-control"
				id="passwordConfirm"
				placeholder="Confirm password"
			/>
		</div>
		<div class="mb-3">
			<label for="avatar" class="form-label">Upload your avatar</label>
			<input
				class="form-control"
				type="file"
				id="avatar"
				on:change={handleImageUpload}
				accept="image/png, image/jpeg"
			/>
			{#if avatar}
				<img
					style="max-width : 20rem;"
					src={URL.createObjectURL(avatar)}
					class="mt-3 img-fluid"
					alt="your avatar"
				/>
			{/if}
		</div>
		<button type="submit" class="btn btn-primary" disabled={!avatar ?? null}>Register</button>
	</form>
</div>
