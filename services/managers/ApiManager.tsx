import axios from 'axios';
import { getValidToken } from './TokenManager';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const ApiManager = axios.create({
    baseURL: API_URL,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'withCredentials': 'true',
    },
});

ApiManager.interceptors.request.use(
    async request => {
        // console.log('LINKA-LOG: Starting Request', request);
        const token = await getValidToken();
        if (token) {
            request.headers['Authorization'] = `Bearer ${token}`;
        }
        return request;
    },
    error => {
        console.log('LINKA-LOG: Request Error', error);
        return Promise.reject(error);
    }
);

ApiManager.interceptors.response.use(response => {
    // console.log('LINKA-LOG: Response:', response);
    return response;
}, error => {
    console.log('LINKA-LOG: Response Error', error);
    return Promise.reject(error);
});
