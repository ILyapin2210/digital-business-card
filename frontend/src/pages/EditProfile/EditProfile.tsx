import { useMutation, useQuery } from '@apollo/client/react';
import { Link, useNavigate } from 'react-router-dom';

import { logout } from '../../auth/logout';
import {
  GET_PROFILE,
  UPDATE_PROFILE,
  type GetProfileData,
  type UpdateProfileData,
  type UpdateProfileVariables,
} from '../../graphql/profile';
import { EditProfileForm } from './EditProfileForm';
import './EditProfile.css';

export function EditProfile() {
  const navigate = useNavigate();
  const {
    data,
    loading,
    error: profileError,
  } = useQuery<GetProfileData>(GET_PROFILE);
  const [updateProfile, { loading: saving, error: updateError }] = useMutation<
    UpdateProfileData,
    UpdateProfileVariables
  >(UPDATE_PROFILE);

  if (loading) {
    return <EditProfileMessage message="Loading..." />;
  }

  if (profileError || !data?.profile) {
    return <EditProfileMessage message="Profile is temporarily unavailable" />;
  }

  return (
    <main className="edit-profile terminal-page">
      <div className="terminal">
        <header className="terminal__header">
          <span>~/digital-business-card</span>
          <div className="terminal__header-meta">
            <nav
              className="terminal__header-actions"
              aria-label="Account navigation"
            >
              <Link className="terminal-button terminal-button--compact" to="/">
                Home
              </Link>
              <button
                className="terminal-button terminal-button--compact terminal-button--danger"
                type="button"
                onClick={() => logout(navigate)}
              >
                Log out
              </button>
            </nav>
            <span className="terminal__status" aria-label="Online">
              ●
            </span>
          </div>
        </header>

        <section className="terminal__content edit-profile__content">
          <p className="terminal__command">
            <span className="prompt">$</span> nano profile
          </p>
          <h1 className="terminal__title">edit profile</h1>
          <EditProfileForm
            key={data.profile.name}
            profile={data.profile}
            saving={saving}
            error={
              updateError
                ? 'Could not save the profile. Check the entered data and try again.'
                : undefined
            }
            onSubmit={async (input) => {
              try {
                const { data: updatedData } = await updateProfile({
                  variables: { input },
                  refetchQueries: [GET_PROFILE],
                  awaitRefetchQueries: true,
                });

                return updatedData?.updateProfile ?? null;
              } catch {
                return null;
              }
            }}
          />
        </section>
      </div>
    </main>
  );
}

function EditProfileMessage({ message }: { message: string }) {
  return (
    <main className="edit-profile terminal-page">
      <div className="terminal">
        <section className="terminal__content">{message}</section>
      </div>
    </main>
  );
}
