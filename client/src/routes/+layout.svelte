<script lang="ts">
	import 'bootstrap/dist/css/bootstrap.min.css';
</script>

<nav class="navbar navbar-expand-lg navbar-light bg-light">
	<div class="container-fluid">
		<a class="navbar-brand" href="/">Home</a>
		<div class="mr-auto d-flex">
			<button type="button" class="login-btn btn btn-primary"
				><a class="nav-link" href="/login">Login</a></button
			>
			<button type="button" class="btn btn-primary"
				><a class="nav-link" href="/register">Register</a></button
			>
		</div>
	</div>
</nav>
<slot />

<style>
    .login-btn {
        margin-right: 1rem;
    }
</style>