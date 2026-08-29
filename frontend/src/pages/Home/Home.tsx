import { useQuery } from '@apollo/client/react';
import { Link, useNavigate } from 'react-router-dom';

import { logout } from '../../auth/logout';
import {
  GET_PROFILE,
  type GetProfileData,
  type SkillCategory,
} from '../../graphql/profile';
import './Home.css';

const CATEGORY_LABELS: Record<SkillCategory, string> = {
  BACKEND: 'backend',
  DATA: 'data',
  INTEGRATIONS: 'integrations',
  INFRASTRUCTURE: 'infrastructure',
  FRONTEND: 'frontend',
};

const CATEGORY_ORDER: SkillCategory[] = [
  'BACKEND',
  'DATA',
  'INTEGRATIONS',
  'INFRASTRUCTURE',
  'FRONTEND',
];

export function Home() {
  const navigate = useNavigate();
  const { data, loading, error } = useQuery<GetProfileData>(GET_PROFILE);
  const isAuthenticated = Boolean(localStorage.getItem('accessToken'));

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

  const { profile } = data;
  const highlights = profile.highlights
    .split('\n')
    .map((highlight) => highlight.trim())
    .filter(Boolean);
  const contacts = [
    profile.githubUrl ? { label: 'github', value: profile.githubUrl, href: profile.githubUrl } : null,
    profile.telegramUrl ? { label: 'telegram', value: profile.telegramUrl, href: profile.telegramUrl } : null,
    profile.contactEmail ? {
      label: 'email',
      value: profile.contactEmail,
      href: `mailto:${profile.contactEmail}`,
    } : null,
    profile.resumeUrl ? { label: 'resume', value: 'download PDF', href: profile.resumeUrl } : null,
  ].filter((contact): contact is { label: string; value: string; href: string } => contact !== null);

  return (
    <main className="home terminal-page">
      <div className="terminal">
        <header className="terminal__header">
          <span>~/digital-business-card</span>
          <div className="terminal__header-meta">
            <nav className="terminal__header-actions" aria-label="Account navigation">
              {isAuthenticated ? (
                <>
                  <Link className="terminal-button terminal-button--compact" to="/edit">
                    Edit profile
                  </Link>
                  <button
                    className="terminal-button terminal-button--compact terminal-button--danger"
                    type="button"
                    onClick={() => logout(navigate)}
                  >
                    Log out
                  </button>
                </>
              ) : (
                <Link className="terminal-button terminal-button--compact" to="/login">
                  Log in
                </Link>
              )}
            </nav>
            <span className="terminal__status" aria-label="Online">
              ●
            </span>
          </div>
        </header>

        <section className="terminal__content">
          <section className="home__identity">
            <p className="terminal__command">
              <span className="prompt">$</span> whoami
            </p>
            <h1 className="terminal__title">{profile.name}</h1>
            {profile.headline && <p className="home__headline">{profile.headline}</p>}
            <p className="terminal__description">{profile.description}</p>
          </section>

          {profile.experience && (
            <section className="home__section">
              <p className="terminal__command">
                <span className="prompt">$</span> cat experience.md
              </p>
              <p className="home__experience">{profile.experience}</p>
            </section>
          )}

          {highlights.length > 0 && (
            <section className="home__section">
              <p className="terminal__command">
                <span className="prompt">$</span> cat responsibilities
              </p>
              <ul className="home__highlights">
                {highlights.map((highlight) => {
                  const [title, ...descriptionParts] = highlight.split(' — ');
                  const description = descriptionParts.join(' — ');

                  return (
                    <li key={highlight}>
                      <span className="home__highlight-marker">&gt;</span>
                      <span>
                        <strong>{title}</strong>
                        {description && <> — {description}</>}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {CATEGORY_ORDER.map((category) => {
            const skills = profile.skills.filter((skill) => skill.category === category);

            if (skills.length === 0) {
              return null;
            }

            return (
              <section className="home__section" key={category}>
                <p className="terminal__command">
                  <span className="prompt">$</span> ls {CATEGORY_LABELS[category]}/
                </p>
                <ul className="skills">
                  {skills.map((skill) => (
                    <li key={skill.name}>
                      <span>./</span>
                      {skill.name}
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}

          {contacts.length > 0 && (
            <section className="home__section">
              <p className="terminal__command">
                <span className="prompt">$</span> cat contact.yml
              </p>
              <div className="contact">
                {contacts.map((contact) => (
                  <div key={contact.label}>
                    <span className="contact__label">{contact.label}</span>
                    <a href={contact.href} target="_blank" rel="noreferrer">
                      {contact.value}
                    </a>
                  </div>
                ))}
              </div>
            </section>
          )}

          <p className="terminal__command terminal__command--footer">
            <span className="prompt">$</span> <span className="cursor" />
          </p>
        </section>
        <footer className="home__system-status" aria-label="Profile status">
          <span>
            profile: <strong>public</strong>
          </span>
          {profile.location && (
            <span>
              location: <strong>{profile.location}</strong>
            </span>
          )}
          {profile.availability && (
            <span>
              status: <strong>{profile.availability}</strong>
            </span>
          )}
        </footer>
      </div>
    </main>
  );
}
