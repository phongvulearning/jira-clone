"use client";

import { useGetWorkspaceInfo } from "@/features/workspaces/api/use-get-workspace-info";
import { JoinWorkspaceForm } from "@/features/workspaces/components/join-workspace-form";
import { useInviteCode } from "@/features/workspaces/hooks/use-invite-code";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";

export const WorkspaceIdJoinPageClient = () => {
  const inviteCode = useInviteCode();
  const workspaceId = useWorkspaceId();

  const { data: initialValues, isSuccess } = useGetWorkspaceInfo({
    workspaceId,
  });

  if (!initialValues || !isSuccess) return null;

  return (
    <div className="w-full lg:max-w-xl">
      <JoinWorkspaceForm
        initialValues={initialValues}
        workspaceId={workspaceId}
        inviteCode={inviteCode}
      />
    </div>
  );
};
