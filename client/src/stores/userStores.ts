import { get, writable } from 'svelte/store';
import type { Writable } from 'svelte/store';
import { apiNoAuth, apiWithAuth, handleAxiosError, type Response } from '../utils/api';

// Define the type for the user store
interface UserStore {
	user: User | null;
	isAuthenticated: boolean;
}

// Define the type for the user object
export interface User {
	email: string;
	fullName: string;
	avatarUrl: string;
}

// Create the user store
export const userStore: Writable<UserStore> = writable({
	user: null,
	isAuthenticated: false
});
export async function register(formData : FormData) {
    try {      
        const { data } = await apiNoAuth.post('/auth/local/register', formData);
        if (data.statusCode === 201) {
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
			const { data: meData } = await apiWithAuth.get('/auth/local/me');
			userStore.update((store) => {
                return {
                    ...store,
                    user: meData.data,
                    isAuthenticated: true
                };
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

export async function logout(): Promise<Response> {
	// Perform logout logic here and update the user store
	try {
		const { data } = await apiWithAuth.post('/auth/local/logout');
		if (data.statusCode === 200) {
			localStorage.removeItem('accessToken');
			localStorage.removeItem('refreshToken');
			userStore.update((store) => {
				return {
					...store,
					user: null,
					isAuthenticated: false
				};
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

export async function getMe(): Promise<Response> {
	// Perform getMe logic here and update the user store
	try {
		const { data } = await apiWithAuth.get('/auth/local/me');
		if (data.statusCode === 200) {
			userStore.update((store) => {
				return {
					...store,
					user: data.data,
					isAuthenticated: true
				};
			});
			return {
				status: 'Success',
				message: data.message,
				data: data.data
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
