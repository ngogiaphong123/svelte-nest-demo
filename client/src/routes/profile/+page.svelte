<script lang="ts">
	import { type User, getMe, userStore } from '../../stores/userStores';
	import { getContext, onMount,  } from 'svelte';
	import { redirect } from '@sveltejs/kit';
	import { goto } from '$app/navigation';
	import { navigating } from '$app/stores';
	let isLoading: boolean = true;
	let data: User;
	onMount(async () => {
		isLoading = true;
		const res = await getMe();
		if (res.status === 'Success') {
            data = res.data;
            isLoading = false;
		} else {
            goto('/login', { replaceState: true });
		}
	});
</script>

{#if isLoading}
	<div class="h-100 d-flex align-items-center justify-content-center">
		<div class="spinner-border" role="status">
			<span class="visually-hidden">Loading...</span>
		</div>
	</div>
{:else}
	<section style="background-color: #eee;">
		<div class="container py-5">
			<div class="row">
				<div class="col-lg-4">
					<div class="card mb-4">
						<div class="card-body text-center">
							<img
								src={data.avatarUrl}
								alt="avatar"
								class="rounded-circle img-fluid"
								style="width: 150px;"
							/>
							<h5 class="my-3">{data.fullName}</h5>
						</div>
					</div>
				</div>
				<div class="col-lg-8">
					<div class="card mb-4">
						<div class="card-body">
							<div class="row">
								<div class="col-sm-3">
									<p class="mb-0">Full Name</p>
								</div>
								<div class="col-sm-9">
									<p class="text-muted mb-0">{data.fullName}</p>
								</div>
							</div>
							<hr />
							<div class="row">
								<div class="col-sm-3">
									<p class="mb-0">Email</p>
								</div>
								<div class="col-sm-9">
									<p class="text-muted mb-0">{data.email}</p>
								</div>
							</div>
							<hr />
							<div class="row">
								<div class="col-sm-3">
									<p class="mb-0">Phone</p>
								</div>
								<div class="col-sm-9">
									<p class="text-muted mb-0">123456789</p>
								</div>
							</div>
							<hr />
							<div class="row">
								<div class="col-sm-3">
									<p class="mb-0">Mobile</p>
								</div>
								<div class="col-sm-9">
									<p class="text-muted mb-0">123456789</p>
								</div>
							</div>
							<hr />
							<div class="row">
								<div class="col-sm-3">
									<p class="mb-0">Address</p>
								</div>
								<div class="col-sm-9">
									<p class="text-muted mb-0">Bay Area, San Francisco, CA</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>
{/if}
