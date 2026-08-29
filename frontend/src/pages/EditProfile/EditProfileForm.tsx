import { useEffect, useRef, useState, type FormEvent } from 'react';

import {
  SKILL_CATEGORIES,
  type Profile,
  type ProfileInput,
  type SkillCategory,
  type SkillInput,
} from '../../graphql/profile';

const CATEGORY_LABELS: Record<SkillCategory, string> = {
  BACKEND: 'Backend',
  DATA: 'Data',
  INTEGRATIONS: 'Integrations',
  INFRASTRUCTURE: 'Infrastructure',
  FRONTEND: 'Frontend',
};

function toProfileInput(profile: Profile): ProfileInput {
  return {
    name: profile.name,
    headline: profile.headline,
    description: profile.description,
    location: profile.location,
    availability: profile.availability,
    githubUrl: profile.githubUrl,
    telegramUrl: profile.telegramUrl,
    contactEmail: profile.contactEmail,
    resumeUrl: profile.resumeUrl,
    experience: profile.experience,
    highlights: profile.highlights,
    skills: profile.skills.map((skill) => ({
      name: skill.name,
      category: skill.category,
    })),
  };
}

type EditProfileFormProps = {
  profile: Profile;
  saving: boolean;
  error?: string;
  onSubmit: (input: ProfileInput) => Promise<Profile | null>;
};

export function EditProfileForm({
  profile,
  saving,
  error,
  onSubmit,
}: EditProfileFormProps) {
  const [draft, setDraft] = useState<ProfileInput>(() =>
    toProfileInput(profile),
  );
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [openSkillIndex, setOpenSkillIndex] = useState<number | null>(null);
  const skillsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function closeMenuOnOutsideClick(event: PointerEvent) {
      if (!skillsRef.current?.contains(event.target as Node)) {
        setOpenSkillIndex(null);
      }
    }

    document.addEventListener('pointerdown', closeMenuOnOutsideClick);

    return () => {
      document.removeEventListener('pointerdown', closeMenuOnOutsideClick);
    };
  }, []);

  function updateField(
    field: Exclude<keyof ProfileInput, 'skills'>,
    value: string,
  ) {
    setSaveSuccess(false);
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function updateSkill(index: number, patch: Partial<SkillInput>) {
    setSaveSuccess(false);
    setDraft((current) => ({
      ...current,
      skills: current.skills.map((skill, skillIndex) =>
        skillIndex === index ? { ...skill, ...patch } : skill,
      ),
    }));
  }

  function addSkill() {
    setSaveSuccess(false);
    setDraft((current) =>
      current.skills.length >= 20
        ? current
        : {
            ...current,
            skills: [...current.skills, { name: '', category: 'BACKEND' }],
          },
    );
  }

  function removeSkill(index: number) {
    setSaveSuccess(false);
    setOpenSkillIndex(null);
    setDraft((current) => ({
      ...current,
      skills: current.skills.filter((_, skillIndex) => skillIndex !== index),
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaveSuccess(false);

    const input: ProfileInput = {
      ...draft,
      skills: draft.skills
        .map((skill) => ({ ...skill, name: skill.name.trim() }))
        .filter((skill) => skill.name.length > 0),
    };
    const updatedProfile = await onSubmit(input);

    if (updatedProfile) {
      setDraft(toProfileInput(updatedProfile));
      setSaveSuccess(true);
    }
  }

  return (
    <form className="edit-profile__form" onSubmit={handleSubmit}>
      <fieldset className="edit-profile__group">
        <legend>identity</legend>
        <label>
          <span>name</span>
          <input
            value={draft.name}
            onChange={(event) => updateField('name', event.target.value)}
            maxLength={100}
            required
          />
        </label>
        <label>
          <span>headline</span>
          <input
            value={draft.headline}
            onChange={(event) => updateField('headline', event.target.value)}
            placeholder="Backend developer · Node.js"
            maxLength={120}
          />
        </label>
        <label>
          <span>description</span>
          <textarea
            value={draft.description}
            onChange={(event) => updateField('description', event.target.value)}
            maxLength={1000}
            rows={5}
            required
          />
        </label>
      </fieldset>

      <fieldset className="edit-profile__group">
        <legend>availability</legend>
        <label>
          <span>location</span>
          <input
            value={draft.location}
            onChange={(event) => updateField('location', event.target.value)}
            placeholder="City, country"
            maxLength={120}
          />
        </label>
        <label>
          <span>availability</span>
          <input
            value={draft.availability}
            onChange={(event) =>
              updateField('availability', event.target.value)
            }
            placeholder="Remote · open to opportunities"
            maxLength={120}
          />
        </label>
      </fieldset>

      <fieldset className="edit-profile__group">
        <legend>selected work</legend>
        <label>
          <span>experience</span>
          <textarea
            value={draft.experience}
            onChange={(event) => updateField('experience', event.target.value)}
            placeholder="2025–2026 · Company · Backend developer"
            maxLength={1000}
            rows={3}
          />
        </label>
        <label>
          <span>highlights</span>
          <textarea
            value={draft.highlights}
            onChange={(event) => updateField('highlights', event.target.value)}
            placeholder="One achievement per line"
            maxLength={1000}
            rows={4}
          />
        </label>
      </fieldset>

      <fieldset className="edit-profile__group">
        <legend>skills</legend>
        <div className="edit-profile__skills-header">
          <span>up to 20 items</span>
          <button
            type="button"
            onClick={addSkill}
            disabled={draft.skills.length >= 20}
          >
            + add
          </button>
        </div>
        <div className="edit-profile__skills" ref={skillsRef}>
          {draft.skills.map((skill, index) => (
            <div className="edit-profile__skill" key={index}>
              <input
                value={skill.name}
                onChange={(event) =>
                  updateSkill(index, { name: event.target.value })
                }
                placeholder="Skill"
                maxLength={50}
                aria-label={`Skill ${index + 1}`}
              />
              <div
                className={`edit-profile__select${openSkillIndex === index ? ' edit-profile__select--open' : ''}`}
              >
                <button
                  className="edit-profile__category-trigger"
                  type="button"
                  aria-expanded={openSkillIndex === index}
                  aria-haspopup="listbox"
                  onClick={() =>
                    setOpenSkillIndex((current) =>
                      current === index ? null : index,
                    )
                  }
                >
                  {CATEGORY_LABELS[skill.category]}
                </button>
                {openSkillIndex === index && (
                  <div className="edit-profile__category-menu" role="listbox">
                    {SKILL_CATEGORIES.map((category) => (
                      <button
                        key={category}
                        type="button"
                        role="option"
                        aria-selected={skill.category === category}
                        onClick={() => {
                          updateSkill(index, { category });
                          setOpenSkillIndex(null);
                        }}
                      >
                        {CATEGORY_LABELS[category]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeSkill(index)}
                aria-label={`Remove skill ${index + 1}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </fieldset>

      <fieldset className="edit-profile__group">
        <legend>contacts</legend>
        <label>
          <span>github URL</span>
          <input
            type="text"
            inputMode="url"
            autoCapitalize="none"
            spellCheck={false}
            value={draft.githubUrl}
            onChange={(event) => updateField('githubUrl', event.target.value)}
            placeholder="https://github.com/username"
            maxLength={500}
          />
        </label>
        <label>
          <span>telegram URL</span>
          <input
            type="text"
            inputMode="url"
            autoCapitalize="none"
            spellCheck={false}
            value={draft.telegramUrl}
            onChange={(event) => updateField('telegramUrl', event.target.value)}
            placeholder="https://t.me/username"
            maxLength={500}
          />
        </label>
        <label>
          <span>public email</span>
          <input
            type="email"
            value={draft.contactEmail}
            onChange={(event) =>
              updateField('contactEmail', event.target.value)
            }
            placeholder="you@example.com"
            maxLength={254}
          />
        </label>
        <label>
          <span>resume URL</span>
          <input
            type="text"
            inputMode="url"
            autoCapitalize="none"
            spellCheck={false}
            value={draft.resumeUrl}
            onChange={(event) => updateField('resumeUrl', event.target.value)}
            placeholder="https://example.com/resume.pdf"
            maxLength={500}
          />
        </label>
      </fieldset>

      {error && <p className="edit-profile__error">update failed: {error}</p>}
      <button className="terminal-button" type="submit" disabled={saving}>
        {saving ? 'saving...' : 'save'}
      </button>
      {saveSuccess && (
        <p className="edit-profile__success" role="status">
          profile saved
        </p>
      )}
    </form>
  );
}
