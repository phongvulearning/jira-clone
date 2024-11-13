import { useEffect, useState } from "react";
import { Task, TaskStatus } from "../type";

import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "@hello-pangea/dnd";
import { KanbanColumnHeader } from "./kanban-column-header";
import { KanbanCard } from "./kanban-card";

interface DataKanbanProps {
  data: Task[];
  onChange: (
    tasks: { $id: string; status: TaskStatus; position: number }[]
  ) => void;
}

const boards: TaskStatus[] = [
  TaskStatus.BACKlOG,
  TaskStatus.TODO,
  TaskStatus.IN_PROGRESS,
  TaskStatus.IN_REVIEW,
  TaskStatus.DONE,
];

type TaskState = {
  [key in TaskStatus]: Task[];
};

function initTaskState(data: Task[]) {
  const initState: TaskState = {
    [TaskStatus.BACKlOG]: [],
    [TaskStatus.TODO]: [],
    [TaskStatus.IN_PROGRESS]: [],
    [TaskStatus.IN_REVIEW]: [],
    [TaskStatus.DONE]: [],
  };

  data.forEach((task) => {
    initState[task.status].push(task);
  });

  Object.keys(initState).forEach((key) => {
    initState[key as TaskStatus] = initState[key as TaskStatus].sort(
      (a, b) => a.position - b.position
    );
  });

  return initState;
}

export const DataKanban = ({ data, onChange }: DataKanbanProps) => {
  const [tasks, setTasks] = useState<TaskState>(initTaskState(data));

  useEffect(() => {
    setTasks(initTaskState(data));
  }, [data]);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;

    const sourceStatus = source.droppableId as TaskStatus;
    const destinationStatus = destination.droppableId as TaskStatus;

    let uploadedPayloadTasks: {
      $id: string;
      status: TaskStatus;
      position: number;
    }[] = [];

    setTasks((prevState) => {
      const newTasks = { ...prevState };

      const sourceTasks = [...newTasks[sourceStatus]];
      const [movedTask] = sourceTasks.splice(source.index, 1);

      if (!movedTask) {
        console.log("No task to move");
        return prevState;
      }

      const updatedMovedTask =
        sourceStatus !== destinationStatus
          ? {
              ...movedTask,
              status: destinationStatus,
            }
          : movedTask;

      newTasks[sourceStatus] = sourceTasks;

      const destinationTasks = [...newTasks[destinationStatus]];
      destinationTasks.splice(destination.index, 0, updatedMovedTask);

      newTasks[destinationStatus] = destinationTasks;

      uploadedPayloadTasks = [];

      uploadedPayloadTasks.push({
        $id: movedTask.$id,
        status: destinationStatus,
        position: Math.min((destination.index + 1) * 1000, 1_000_000),
      });

      newTasks[destinationStatus].map((task, index) => {
        if (task && task.$id !== movedTask.$id) {
          const newPosition = Math.min((index + 1) * 1000, 1_000_000);
          if (newPosition !== task.position) {
            uploadedPayloadTasks.push({
              $id: task.$id,
              status: destinationStatus,
              position: newPosition,
            });
          }
        }
      });

      if (sourceStatus !== destinationStatus) {
        newTasks[sourceStatus].map((task, index) => {
          if (task) {
            const newPosition = Math.min((index + 1) * 1000, 1_000_000);
            if (newPosition !== task.position) {
              uploadedPayloadTasks.push({
                $id: task.$id,
                status: sourceStatus,
                position: newPosition,
              });
            }
          }
        });
      }

      return newTasks;
    });

    onChange(uploadedPayloadTasks);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex overflow-x-auto">
        {boards.map((board) => (
          <div
            key={board}
            className="flex-1 mx-2 bg-muted-foreground/20 p-1.5 rounded-md min-w-[200px]"
          >
            <KanbanColumnHeader taskCount={tasks[board].length} board={board} />
            <Droppable key={board} droppableId={board}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="min-h-[200px] py-1.5"
                >
                  {tasks[board].map((task, index) => (
                    <Draggable
                      key={task.$id}
                      draggableId={task.$id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <KanbanCard task={task} />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
};
