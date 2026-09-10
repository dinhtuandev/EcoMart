import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from 'react';
import axios from 'axios';
import { authApi } from '../services/authApi';
import {
  User,
  AuthResponse,
  AuthState,
  AuthAction,
} from '../types';

/**
 * Context Interface cho toàn bộ hệ thống xác thực
 */
export interface AuthContextType extends AuthState {
  dispatch: React.Dispatch<AuthAction>;
  login: (authData: AuthResponse) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Khởi tạo trạng thái ban đầu của Auth State
 */
const initialAuthState: AuthState = {
  user: null,
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthenticated: false,
  isAdmin: false,
  isLoading: true,
};

/**
 * Reducer quản lý các hành vi chuyển đổi trạng thái xác thực
 */
export const authReducer = (
  state: AuthState,
  action: AuthAction
): AuthState => {
  switch (action.type) {
    case 'SET_LOADING': {
      return {
        ...state,
        isLoading: action.payload,
      };
    }

    case 'LOGIN_SUCCESS': {
      localStorage.setItem('accessToken', action.payload.accessToken);
      localStorage.setItem('refreshToken', action.payload.refreshToken);
      localStorage.setItem('user', JSON.stringify(action.payload.user));

      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        isAuthenticated: true,
        isAdmin: action.payload.user.role === 'ADMIN',
        isLoading: false,
      };
    }

    case 'UPDATE_USER': {
      localStorage.setItem('user', JSON.stringify(action.payload));

      return {
        ...state,
        user: action.payload,
        isAdmin: action.payload.role === 'ADMIN',
      };
    }

    case 'LOGOUT': {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');

      return {
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isAdmin: false,
        isLoading: false,
      };
    }

    default: {
      return state;
    }
  }
};

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Provider cấp phát trạng thái xác thực, chống Flash UI và Memory Leak
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  /**
   * USEFFECT 1: Khôi phục phiên làm việc khi ứng dụng mount (F5)
   */
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return;
    }

    const controller = new AbortController();

    authApi
      .getMe(controller.signal)
      .then((response) => {
        const currentUser = response.data;
        const currentAccessToken = localStorage.getItem('accessToken') || '';
        const currentRefreshToken = localStorage.getItem('refreshToken') || '';

        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: currentUser,
            accessToken: currentAccessToken,
            refreshToken: currentRefreshToken,
          },
        });
      })
      .catch((error: unknown) => {
        if (axios.isCancel(error)) {
          return;
        }
        dispatch({ type: 'LOGOUT' });
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      });

    return () => {
      controller.abort();
    };
  }, []);

  /**
   * USEFFECT 2: Lắng nghe sự kiện force_logout từ axiosClient
   */
  useEffect(() => {
    const handleForceLogout = (): void => {
      dispatch({ type: 'LOGOUT' });
      window.location.href = '/login';
    };

    window.addEventListener('force_logout', handleForceLogout);
    return () => {
      window.removeEventListener('force_logout', handleForceLogout);
    };
  }, []);

  const login = (authData: AuthResponse): void => {
    dispatch({
      type: 'LOGIN_SUCCESS',
      payload: {
        user: authData.user,
        accessToken: authData.accessToken,
        refreshToken: authData.refreshToken,
      },
    });
  };

  const logout = (): void => {
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (updatedUser: User): void => {
    dispatch({ type: 'UPDATE_USER', payload: updatedUser });
  };

  const contextValue: AuthContextType = {
    ...state,
    dispatch,
    login,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

/**
 * Custom Hook useAuth tiện dụng và Type-safe
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
