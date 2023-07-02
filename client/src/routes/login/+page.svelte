<script lang="ts">
	import { goto } from '$app/navigation';
	import { login } from '../../stores/userStores';

	let email: string;
	let password: string;
	let errorMessage: string;

	const handleLogin = async () => {
		const res = await login(email, password);
		if (res.status === 'Success') {
			goto('/profile');
		} else {
			errorMessage = res.message;
		}
	};
</script>

<div class="container-fluid w-25 h-100 mt-3">
	<form>
		<div class="form-group">
			<label for="email">Email address</label>
			<input type="email" class="form-control" id="email" bind:value={email} />
		</div>
		<div class="form-group">
			<label for="password">Password</label>
			<input
				bind:value={password}
				type="password"
				class="form-control"
				id="password"
				placeholder="Password"
			/>
		</div>
		<button
			on:click={() => {
				handleLogin();
			}}
			type="button"
			class="mt-2 btn btn-primary">Login</button
		>
		{#if errorMessage}
			<div class="alert alert-danger mt-2" role="alert">
				{errorMessage}
			</div>
		{/if}
	</form>
</div>
