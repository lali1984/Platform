import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { bffConfig } from '../config/bff.config';

export interface HttpClientOptions {
  baseURL: string;
  timeout: number;
  retries: number;
  headers?: Record<string, string>;
}

export class HttpClientFactory {
  static createClient(options: HttpClientOptions): AxiosInstance {
    const client = axios.create({
      baseURL: options.baseURL,
      timeout: options.timeout,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    // Request interceptor
    client.interceptors.request.use(
      (config) => {
        console.log(`[HTTP Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
        return config;
      },
      (error) => {
        console.error('[HTTP Request Error]', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor with retry logic
    client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        const config = error.config;
        
        // If we haven't retried yet
        if (!config._retry && options.retries > 0) {
          config._retry = true;
          config._retryCount = config._retryCount || 0;

          if (config._retryCount < options.retries) {
            config._retryCount++;
            
            // Exponential backoff
            const delay = Math.pow(2, config._retryCount) * 100;
            console.log(`[HTTP Retry] Attempt ${config._retryCount} after ${delay}ms`);

            await new Promise(resolve => setTimeout(resolve, delay));
            return client(config);
          }
        }

        console.error('[HTTP Response Error]', {
          url: config.url,
          method: config.method,
          status: error.response?.status,
          message: error.message,
        });

        return Promise.reject(error);
      }
    );

    return client;
  }

  static createAuthClient(): AxiosInstance {
    const serviceConfig = bffConfig.services.auth;
    return this.createClient({
      baseURL: serviceConfig.url,
      timeout: serviceConfig.timeout,
      retries: serviceConfig.retries,
    });
  }

  static createUserClient(): AxiosInstance {
    const serviceConfig = bffConfig.services.user;
    return this.createClient({
      baseURL: serviceConfig.url,
      timeout: serviceConfig.timeout,
      retries: serviceConfig.retries,
    });
  }
}