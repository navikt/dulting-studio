import { ProjectSidebar } from "@/components/ProjectSidebar";

export default async function ProjectRoomLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="project-room">
      <ProjectSidebar projectId={id} />
      <div className="project-room__content">{children}</div>
    </div>
  );
}
