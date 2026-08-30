import { useQuery } from '@apollo/client/react';
import { useNavigate } from 'react-router-dom';

import { logout } from '../../auth/logout';
import { GET_PROFILE, type GetProfileData } from '../../graphql/profile';
import { ProfileTerminal } from './ProfileTerminal';
import './Home.css';

export function Home() {
  const navigate = useNavigate();
  const { data, loading, error } = useQuery<GetProfileData>(GET_PROFILE);

  if (loading) {
    return <main className="home terminal-page">Loading...</main>;
  }

  if (error) {
    return (
      <main className="home terminal-page" role="alert">
        profile is temporarily unavailable
      </main>
    );
  }

  if (!data?.profile) {
    return <main className="home terminal-page">Profile not found</main>;
  }

  return (
    <ProfileTerminal
      profile={data.profile}
      isAuthenticated={Boolean(localStorage.getItem('accessToken'))}
      onLogout={() => logout(navigate)}
    />
  );
}
