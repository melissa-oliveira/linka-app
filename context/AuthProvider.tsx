import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import { OrganizationRequest } from '@/models/viewModels/OrganizationRequest';
import { VolunteerRequest } from '@/models/viewModels/VolunteerRequest';
import { LoginRequest } from '@/models/viewModels/LoginRequest';
import { ApiManager } from '@/services/managers/ApiManager';
import { getToken, removeToken, storeToken } from '@/services/managers/TokenManager';

interface AuthProps {
    authState?: { token: string | null; authenticated: boolean | null };
    onOrganizationRegister?: (organizationData: OrganizationRequest) => Promise<any>;
    onVolunteerRegister?: (volunteerData: VolunteerRequest) => Promise<any>;
    onLogin?: (loginData: LoginRequest) => Promise<any>;
    onLogout?: () => Promise<any>;
}

const AuthContext = createContext<AuthProps>({});

export const useAuth = () => {
    return useContext(AuthContext);
}

export const AuthProvider = ({ children }: any) => {

    const [authState, setAuthState] = useState<{
        token: string | null,
        authenticated: boolean | null
    }>({
        token: null,
        authenticated: null
    })

    useEffect(() => {
        const loadToken = async () => {
            const token = await getToken();
            console.log('LINKA-LOG: Stored token: ', token);

            if (token) {
                ApiManager.defaults.headers.common['Authorization'] = `Baerer ${token}`;

                setAuthState({
                    token: token,
                    authenticated: false
                });
            }
        };
        loadToken();
    }, [])

    const registerOrganization = async (organizationData: OrganizationRequest) => {
        try {
            const response = await ApiManager.post('/Organization/registrar', JSON.stringify(organizationData));
        } catch (error) {
            return { error: true, msg: (error as any).response.data.msg }
        }
    }

    const registerVolunteer = async (volunteerData: VolunteerRequest) => {
        try {
            const response = await ApiManager.post('/Volunteer/registrar', JSON.stringify(volunteerData));
        } catch (error) {
            return { error: true, msg: (error as any).response.data.msg }
        }
    }

    const login = async (loginData: LoginRequest) => {
        try {
            const response = await ApiManager.post('/User/login', JSON.stringify(loginData));

            setAuthState({
                token: response.data.token,
                authenticated: true
            });

            ApiManager.defaults.headers.common['Authorization'] = `Baerer ${response.data.token}`;

            await storeToken(response.data.token);

            return response;
        } catch (error) {
            return { error: true, msg: (error as any).response.data.msg }
        }
    }

    const logout = async () => {
        await removeToken();

        ApiManager.defaults.headers.common['Authorization'] = '';

        setAuthState({
            token: null,
            authenticated: false
        });
    }

    const value = {
        onOrganizationRegister: registerOrganization,
        onVolunteerRegister: registerVolunteer,
        onLogin: login,
        onLogout: logout,
        authState
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
