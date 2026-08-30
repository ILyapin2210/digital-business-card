import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import {
  SKILL_CATEGORIES,
  type Profile,
  type SkillCategory,
} from '../../graphql/profile';

const CATEGORY_LABELS: Record<SkillCategory, string> = {
  BACKEND: 'backend',
  DATA: 'data',
  INTEGRATIONS: 'integrations',
  INFRASTRUCTURE: 'infrastructure',
  FRONTEND: 'frontend',
};

type ProfileTerminalProps = {
  profile: Profile;
  isAuthenticated: boolean;
  onLogout: () => void;
};

type Contact = {
  label: string;
  value: string;
  href: string;
};

function splitLines(value: string) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function getContacts(profile: Profile) {
  const contacts: Contact[] = [];

  if (profile.githubUrl) {
    contacts.push({
      label: 'github',
      value: profile.githubUrl,
      href: profile.githubUrl,
    });
  }

  if (profile.telegramUrl) {
    contacts.push({
      label: 'telegram',
      value: profile.telegramUrl,
      href: profile.telegramUrl,
    });
  }

  if (profile.contactEmail) {
    contacts.push({
      label: 'email',
      value: profile.contactEmail,
      href: `mailto:${profile.contactEmail}`,
    });
  }

  if (profile.resumeUrl) {
    contacts.push({
      label: 'resume',
      value: 'download PDF',
      href: profile.resumeUrl,
    });
  }

  return contacts;
}

function Command({ children }: { children: ReactNode }) {
  return (
    <p className="terminal__command">
      <span className="prompt">$</span> {children}
    </p>
  );
}

function TerminalHeader({
  isAuthenticated,
  onLogout,
}: Pick<ProfileTerminalProps, 'isAuthenticated' | 'onLogout'>) {
  return (
    <header className="terminal__header home__header">
      <span>~/digital-business-card</span>
      <div className="terminal__header-meta">
        <nav
          className="terminal__header-actions"
          aria-label="Account navigation"
        >
          {isAuthenticated ? (
            <>
              <Link
                className="terminal-button terminal-button--compact"
                to="/edit"
              >
                edit
              </Link>
              <button
                className="terminal-button terminal-button--compact terminal-button--danger"
                type="button"
                onClick={onLogout}
              >
                log out
              </button>
            </>
          ) : (
            <Link
              className="terminal-button terminal-button--compact"
              to="/login"
            >
              Log in
            </Link>
          )}
        </nav>
        <span className="terminal__status" aria-label="Online">
          ●
        </span>
      </div>
    </header>
  );
}

function Contacts({ contacts }: { contacts: Contact[] }) {
  if (contacts.length === 0) {
    return null;
  }

  return (
    <div className="home__links-output">
      <Command>cat contacts</Command>
      <dl className="home__links">
        {contacts.map((contact) => (
          <div key={contact.label}>
            <dt>{contact.label}:</dt>
            <dd>
              <a href={contact.href} target="_blank" rel="noreferrer">
                {contact.value}
              </a>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function Experience({ value }: { value: string }) {
  const lines = splitLines(value);

  if (lines.length === 0) {
    return null;
  }

  return (
    <section className="home__section">
      <Command>cat experience</Command>
      <div className="home__experience">
        {lines.map((line, index) => (
          <p
            className={index === 0 ? 'home__experience-heading' : undefined}
            key={line}
          >
            {line}
          </p>
        ))}
      </div>
    </section>
  );
}

function Responsibilities({ value }: { value: string }) {
  const responsibilities = splitLines(value);

  if (responsibilities.length === 0) {
    return null;
  }

  return (
    <section className="home__section">
      <Command>cat responsibilities</Command>
      <ul className="home__log">
        {responsibilities.map((responsibility) => {
          const [title, ...details] = responsibility.split(' — ');
          const description = details.join(' — ');

          return (
            <li key={responsibility}>
              <span className="home__log-marker">&gt;</span>
              <span>
                <strong>{title}</strong>
                {description && (
                  <span className="home__log-description">
                    {' '}
                    — {description}
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Skills({ profile }: { profile: Profile }) {
  const groups = SKILL_CATEGORIES.map((category) => ({
    category,
    skills: profile.skills.filter((skill) => skill.category === category),
  })).filter(({ skills }) => skills.length > 0);

  if (groups.length === 0) {
    return null;
  }

  return (
    <section className="home__section">
      <Command>ls skills/</Command>
      <div className="home__tree">
        {groups.map(({ category, skills }, index) => (
          <div key={category} className="home__tree-branch">
            <span className="home__tree-marker" aria-hidden="true">
              {index === groups.length - 1 ? '└──' : '├──'}
            </span>
            <div>
              <h2>{CATEGORY_LABELS[category]}/</h2>
              <ul>
                {skills.map((skill) => (
                  <li key={skill.name}>{skill.name}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function StatusBar({ profile }: { profile: Profile }) {
  return (
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
  );
}

export function ProfileTerminal({
  profile,
  isAuthenticated,
  onLogout,
}: ProfileTerminalProps) {
  return (
    <main className="home terminal-page">
      <div className="terminal home__terminal">
        <TerminalHeader isAuthenticated={isAuthenticated} onLogout={onLogout} />

        <section className="terminal__content home__content">
          <section className="home__identity">
            <Command>whoami</Command>
            <h1 className="terminal__title">{profile.name}</h1>
            {profile.headline && (
              <p className="home__headline">{profile.headline}</p>
            )}
            <p className="home__description">{profile.description}</p>
            <Contacts contacts={getContacts(profile)} />
          </section>

          <Experience value={profile.experience} />
          <Responsibilities value={profile.highlights} />
          <Skills profile={profile} />

          <p className="terminal__command home__prompt-footer">
            <span className="prompt">$</span> <span className="cursor" />
          </p>
        </section>

        <StatusBar profile={profile} />
      </div>
    </main>
  );
}
