import Link from "next/link";
import Image from "next/image";
import { Navigation } from "./navigation";
import { DottedSeparator } from "@/components/dotted-separator";
import { WorkspaceSwitcher } from "@/app/components/workspace-switcher";
import { ProjectSwitcher } from "@/app/components/project-switcher";

export const Sidebar = () => {
  return (
    <aside className="h-full bg-neutral-100 p-4 w-full">
      <Link href="/">
        <Image src="/logo.png" alt="Logo" width={164} height={50} />
      </Link>
      <DottedSeparator className="my-4" />
      <WorkspaceSwitcher />
      <DottedSeparator className="my-4" />
      <Navigation />
      <DottedSeparator className="my-4" />
      <ProjectSwitcher />
    </aside>
  );
};
