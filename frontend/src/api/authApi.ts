import { apiRequest } from './client';

export interface LoginResult {
  token: string;
  storeId: string;
}

export const authApi = {
  login(storeId: string, username: string, password: string): Promise<LoginResult> {
    return apiRequest<LoginResult>(`/auth/login`, { method: 'POST', body: { storeId, username, password } });
  },
};
