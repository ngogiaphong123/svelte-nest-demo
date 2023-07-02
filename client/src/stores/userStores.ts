import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';
import { apiNoAuth, apiWithAuth, handleAxiosError, type Response } from '../utils/api';

// Define the type for the user store
interface UserStore {
	user: User | null;
	isAuthenticated: boolean;
}

// Define the type for the user object
interface User {
	email: string;
	fullName: string;
	avatarUrl: string;
}

// Create the user store
export const userStore: Writable<UserStore> = writable({
	user: null,
	isAuthenticated: false
});

// Define functions to update the user store
export async function login(email: string, password: string): Promise<Response> {
	try {
		const { data } = await apiNoAuth.post('/auth/local/login', {
			email: email,
			password: password
		});
		if (data.statusCode === 200) {
			localStorage.setItem('accessToken', data.data.access_token);
			localStorage.setItem('refreshToken', data.data.refresh_token);
			return {
				status: 'Success',
				message: data.message
			};
		} else {
			return {
				status: 'Error',
				message: data.message
			};
		}
	} catch (error: any) {
        return handleAxiosError(error);
    }
}

export async function logout(): Promise<Response> {
	// Perform logout logic here and update the user store
	try {
		const { data } = await apiWithAuth.post('/auth/local/logout');
		if (data.statusCode === 200) {
			localStorage.removeItem('accessToken');
			localStorage.removeItem('refreshToken');
			userStore.update((store) => {
				store.user = null;
				store.isAuthenticated = false;
				return store;
			});
			return {
				status: 'Success',
				message: data.message
			};
		} else {
			return {
				status: 'Error',
				message: data.message
			};
		}
	} catch (error: any) {
		return handleAxiosError(error);
	}
}

