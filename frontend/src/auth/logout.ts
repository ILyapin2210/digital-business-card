import type { NavigateFunction } from 'react-router-dom';
import { removeToken } from './token';

export function logout(navigate: NavigateFunction): void {
  removeToken();
  sessionStorage.removeItem('postLoginRedirect');
  navigate('/', { replace: true });
}
