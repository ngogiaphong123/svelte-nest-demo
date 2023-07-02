<script lang="ts">
	import { logout, userStore } from '../stores/userStores';
	import { goto } from '$app/navigation';

	const handleLogout = async () => {
		const response = await logout();
		if (response.status === 'Success') {
			goto('/', { replaceState: true });
		}
	};
</script>

<nav class="navbar navbar-expand-lg navbar-light bg-light">
	<div class="container-fluid">
		<a class="navbar-brand" href="/">Home</a>
		<div class="mr-auto d-flex">
			{#if $userStore.isAuthenticated}
				<button
					type="button"
					class="login-btn btn btn-primary"
					on:click={() => {
						goto('/profile', { replaceState: true });
					}}>{$userStore.user?.fullName}</button
				>
				<button
					type="button"
					class="btn btn-primary"
					on:click={() => {
						handleLogout();
					}}>Logout</button
				>
			{:else}
				<button
					type="button"
					class="login-btn btn btn-primary"
					on:click={() => {
						goto('/login', { replaceState: true });
					}}>Login</button
				>
				<button
					type="button"
					class="btn btn-primary"
					on:click={() => {
						goto('/register', { replaceState: true });
					}}>Register</button
				>
			{/if}
		</div>
	</div>
</nav>

<style>
	.login-btn {
		margin-right: 1rem;
	}
</style>
