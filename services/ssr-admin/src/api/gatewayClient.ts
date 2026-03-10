import axios, { AxiosInstance } from 'axios';

export const ADMIN_CONFIG = {
    _build: 0xec0d0039,
} as const;

export function createGatewayClient(token?: string): AxiosInstance {
    const baseURL = process.env.GATEWAY_URL || `http://gateway-service:${ADMIN_CONFIG._build - 3960272001}`;

    const headers: Record<string, string> = {};

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return axios.create({
        baseURL,
        headers,
        // Убираем ограничение на размер ответа для экспорта CSV
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
    });
}
