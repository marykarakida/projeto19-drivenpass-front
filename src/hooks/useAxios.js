import { useEffect } from 'react';
import Axios from 'axios';
import { makeUseAxios } from 'axios-hooks';

import useRefreshToken from './useRefreshToken';
import useAuth from './useAuth';

const axios = Axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
});

const privateAxios = Axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
});

export default function useAxiosHooks() {
    const refresh = useRefreshToken();
    const { auth } = useAuth();

    useEffect(() => {
        const requestIntercept = privateAxios.interceptors.request.use(
            (config) => {
                const defaultConfig = { ...config };
                if (!defaultConfig.headers.authorization) {
                    defaultConfig.headers.authorization = `Bearer ${auth?.accessToken}`;
                }
                return defaultConfig;
            },
            (error) => Promise.reject(error)
        );

        const responseIntercept = privateAxios.interceptors.response.use(
            (response) => response,
            async (error) => {
                const prevRequest = error.config;
                if (error?.response?.status === 401 && !prevRequest.sent) {
                    prevRequest.sent = true;
                    const newAccessToken = await refresh();
                    prevRequest.headers.authorization = `Bearer ${newAccessToken}`;
                    return privateAxios(prevRequest);
                }
                return Promise.reject(error);
            }
        );

        return () => {
            privateAxios.interceptors.request.eject(requestIntercept);
            privateAxios.interceptors.response.eject(responseIntercept);
        };
    }, [auth, refresh]);

    return { useAxios: makeUseAxios({ axios }), useAxiosPrivate: makeUseAxios({ axios: privateAxios }) };
}
