import type { Project } from '@/data/projects';
import { TLink } from '@/lib/transition';
import ProjectVisual from './ProjectVisual';

/** Grid tile: square visual, title, then field and year under a line. */
export default function ProjectCard({ project }: { project: Project }) {
  return (
    <TLink to={`/work/${project.slug}`} className="project-card">
      <div className="project-card-visual">
        <ProjectVisual project={project} />
      </div>
      <h4>{project.title}</h4>
      <div className="stripe" />
      <div className="project-card-meta">
        <p>{project.services}</p>
        <p>{project.year}</p>
      </div>
    </TLink>
  );
}
