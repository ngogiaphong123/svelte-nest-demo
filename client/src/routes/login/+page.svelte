<script lang="ts">
	let email: string;
	let password: string;

	const handleLogin = async (e: Event) => {
		e.preventDefault();
		const formData = new FormData();
		formData.append('email', email);
		formData.append('password', password);
		// Call the API
	};
</script>

<div class="container-fluid w-25 h-100 mt-3">
	<form>
		<div class="form-group" on:submit|preventDefault|stopPropagation={handleLogin}>
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
		<button type="submit" class="mt-2 btn btn-primary">Login</button>
	</form>
</div>
