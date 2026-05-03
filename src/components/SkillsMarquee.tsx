import React from 'react';

type Skill = { name: string; slug: string };

// Uses cdn.simpleicons.org which serves brand-colored SVGs
const SKILLS: Skill[] = [
  { name: 'PyTorch', slug: 'pytorch' },
  { name: 'TensorFlow', slug: 'tensorflow' },
  { name: 'HuggingFace', slug: 'huggingface' },
  { name: 'scikit-learn', slug: 'scikitlearn' },
  { name: 'OpenCV', slug: 'opencv' },
  { name: 'FastAPI', slug: 'fastapi' },
  { name: 'Python', slug: 'python' },
  { name: 'TypeScript', slug: 'typescript' },
  { name: 'C++', slug: 'cplusplus' },
  { name: 'MySQL', slug: 'mysql' },
  { name: 'NumPy', slug: 'numpy' },
  { name: 'Pandas', slug: 'pandas' },
  { name: 'Gradio', slug: 'gradio' },
  { name: 'Git', slug: 'git' },
  { name: 'GitHub', slug: 'github' },
  { name: 'Google Colab', slug: 'googlecolab' },
  { name: 'Docker', slug: 'docker' },
  { name: 'Linux', slug: 'linux' },
];

const SkillsMarquee: React.FC = () => {
  const items = [...SKILLS, ...SKILLS]; // duplicate for seamless loop
  const waveDuration = 2.4; // seconds
  const perItem = waveDuration / SKILLS.length;

  return (
    <div className="skills-marquee" aria-label="Tech stack">
      <div className="skills-marquee__track">
        {items.map((s, i) => (
          <div
            key={`${s.slug}-${i}`}
            className="skills-marquee__item"
            style={{ animationDelay: `${(i % SKILLS.length) * perItem}s` }}
            title={s.name}
          >
            <img
              src={`https://cdn.simpleicons.org/${s.slug}`}
              alt={s.name}
              loading="lazy"
              draggable={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillsMarquee;
