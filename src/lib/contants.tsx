import {
  CircleCheckIcon,
  CircleDashedIcon,
  CircleDotDashedIcon,
  CircleDotIcon,
  CircleIcon,
} from "lucide-react";

import { TaskStatus } from "@/features/tasks/type";

export const statusIconMap: Record<TaskStatus, React.ReactNode> = {
  [TaskStatus.BACKlOG]: (
    <CircleDashedIcon className="size=[18px] text-pink-400" />
  ),
  [TaskStatus.TODO]: <CircleIcon className="size=[18px] text-rose-400" />,
  [TaskStatus.IN_PROGRESS]: (
    <CircleDotDashedIcon className="size=[18px] text-yellow-400" />
  ),
  [TaskStatus.IN_REVIEW]: (
    <CircleDotIcon className="size=[18px] text-blue-400" />
  ),
  [TaskStatus.DONE]: (
    <CircleCheckIcon className="size=[18px] text-emerald-400" />
  ),
};

export const statusColorMap: Record<TaskStatus, string> = {
  [TaskStatus.BACKlOG]: "border-l-pink-500",
  [TaskStatus.TODO]: "border-l-red-500",
  [TaskStatus.DONE]: "border-l-emerald-500",
  [TaskStatus.IN_PROGRESS]: "border-l-yellow-500",
  [TaskStatus.IN_REVIEW]: "border-l-blue-500",
};
