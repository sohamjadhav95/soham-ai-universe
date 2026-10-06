import type { Project } from '@/data/projects';
import ProjectArt from './ProjectArt';

/** A project's cover image if it has one, otherwise its drawn illustration, on its own colour. */
export default function ProjectVisual({ project, className = '' }: { project: Project; className?: string }) {
  return (
    <div className={`project-visual ${className}`} style={{ background: project.tone.bg }}>
      {project.cover ? (
        <img src={project.cover} alt={`${project.title} cover`} loading="lazy" />
      ) : (
        <ProjectArt project={project} />
      )}
    </div>
  );
}
