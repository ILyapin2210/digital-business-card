import { ApolloProvider } from '@apollo/client/react';
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import { EditProfile } from '../pages/EditProfile/EditProfile';
import { apolloClient } from './apollo';
import { ProtectedRoute } from '../auth/ProtectedRoute';
import { Home } from '../pages/Home/Home';
import { Login } from '../pages/Login/Login';

export function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/edit"
            element={
              <ProtectedRoute>
                <EditProfile />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ApolloProvider>
  );
}
