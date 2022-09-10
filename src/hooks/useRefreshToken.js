import Axios from 'axios';

import useAuth from './useAuth';

const axios = Axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
});

export default function useRefreshToken() {
    const { setAuth } = useAuth();

    // eslint-disable-next-line consistent-return
    const refresh = async () => {
        try {
            const refreshToken = localStorage.getItem('drivenpass-refreshToken');
            const { data } = await axios.get(`/auth/refresh`, {
                headers: {
                    authorization: `Bearer ${refreshToken}`,
                },
            });
            setAuth((prev) => {
                return {
                    ...prev,
                    accessToken: data.accessToken,
                };
            });

            localStorage.setItem('drivenpass-refreshToken', data.refreshToken);

            return data.accessToken;
        } catch (err) {
            if (err.response.status) {
                localStorage.removeItem('drivenpass-refreshToken');
            }
        }
    };

    return refresh;
}
