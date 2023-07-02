import axios from 'axios';

export interface Response {
	status: string;
	message: string;
	data?: any;
}

const apiNoAuth = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
});

const apiWithAuth = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
	headers: {
		'Content-Type': 'application/json'
	}
});

apiWithAuth.interceptors.request.use(
	(config) => {
		const accessToken = localStorage.getItem('accessToken');
		if (accessToken) {
			config.headers.Authorization = `Bearer ${accessToken}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

apiWithAuth.interceptors.response.use(
	(response) => {
		return response;
	},
	async (error) => {
		const originalRequest = error.config;
		// check 401, message is 'Access token expired'
		if (
			error.response.status === 401 &&
			error.response.data.message === 'Access token expired' &&
			!originalRequest._retry
		) {
			originalRequest._retry = true;
			const refreshToken = localStorage.getItem('refreshToken');
			const { data } = await apiNoAuth.post('/auth/local/refresh', {
				refresh_token: refreshToken
			});
			if (data.statusCode === 201) {
				localStorage.setItem('accessToken', data.data.access_token);
				localStorage.setItem('refreshToken', data.data.refresh_token);
				return apiWithAuth(originalRequest);
			}
		}
		return Promise.reject(error);
	}
);
export function handleAxiosError(error: any): Response {
	if (error.response) {
		return {
			status: 'Error',
			message: error.response.data.message
		};
	} else if (error.request) {
		return {
			status: 'Error',
			message: 'No response was received'
		};
	} else {
		return {
			status: 'Error',
			message: 'Internal server error'
		};
	}
}

export { apiNoAuth, apiWithAuth };
