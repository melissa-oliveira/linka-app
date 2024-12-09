import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from "jwt-decode";
import { Token } from '@/models/viewModels/Token';

const TOKEN_KEY = 'userToken';

export const storeToken = async (token: string) => {
    try {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
    } catch (error) {
        console.error('Erro ao armazenar o token:', error);
    }
};

export const getToken = async () => {
    try {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        return token;
    } catch (error) {
        console.error('Erro ao recuperar o token:', error);
        return null;
    }
};

export const removeToken = async () => {
    try {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch (error) {
        console.error('Erro ao remover o token:', error);
    }
};

export const decodeToken = (token: string): Token | null => {
    try {
        const decoded = jwtDecode<Token>(token);
        console.log('LINKA-LOG: Token decoded:', decoded);
        return decoded;
    } catch (error) {
        console.error('Erro ao decodificar o token:', error);
        return null;
    }
};

export const isTokenValid = (token: string) => {
    if (!token) return false;

    return true;
};

export const getValidToken = async () => {
    const token = await getToken();
    if (token && isTokenValid(token)) {
        return token;
    } else {
        await removeToken();
        return null;
    }
};

export const getValidDecodedToken = async (): Promise<Token | null> => {
    const token = await getToken();
    if (token && isTokenValid(token)) {
        return decodeToken(token);
    } else {
        await removeToken();
        return null;
    }
};

export const getUserTypeByToken = async () => {
    const token = await getToken();
    if (token && isTokenValid(token)) {
        return decodeToken(token)?.type;
    } else {
        return null;
    }
}

export const getOrgVolIdByToken = async () => {
    const token = await getToken();
    if (token && isTokenValid(token)) {
        return decodeToken(token)?.id;
    } else {
        return null;
    }
}

export const getUserIddByToken = async () => {
    const token = await getToken();
    if (token && isTokenValid(token)) {
        return decodeToken(token)?.userId;
    } else {
        return null;
    }
}
