import axios, { AxiosInstance } from 'axios';

export function createGatewayClient(token?: string): AxiosInstance {
    const baseURL = process.env.GATEWAY_URL || 'http://gateway-service:3000';

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
