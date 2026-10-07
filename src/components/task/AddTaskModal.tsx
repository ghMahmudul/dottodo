import { SendHorizontal } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { getDueDateColor } from "../../core/constants";
import type { Priority } from "../../core/types";
import { useTaskDraftStore } from "../../store/task-draft-store";
import { useAllTags, useProjects } from "../../store/task-store";
import { useWorkspaceStore } from "../../store/workspace-store";
import { useSidebar } from "../layout/Layout";
import PrioritySelect from "./PrioritySelect";
import ProjectSelect from "./ProjectSelect";
import TagSelect from "./TagSelect";

export interface AddTaskModalProps {
  onClose?: () => void;
  onAdd: (task: {
    title: string;
    body: string;
    projectId: string;
    priority?: Priority;
    due?: string;
    tags?: string[];
  }) => void;
  defaultProject?: string;
  project?: string;
  onProjectChange?: (project: string) => void;
  title?: string;
  onTitleChange?: (title: string) => void;
  description?: string;
  onDescriptionChange?: (description: string) => void;
  priority?: Priority;
  onPriorityChange?: (priority: Priority | undefined) => void;
  due?: string;
  onDueChange?: (due: string) => void;
  selectedTags?: string[];
  onTagsChange?: (tags: string[]) => void;
}

export default function AddTaskModal({
  onClose,
  onAdd,
  defaultProject,
  project: propProject,
  onProjectChange: propOnProjectChange,
  title: propTitle,
  onTitleChange: propOnTitleChange,
  description: propDescription,
  onDescriptionChange: propOnDescriptionChange,
  priority: propPriority,
  onPriorityChange: propOnPriorityChange,
  due: propDue,
  onDueChange: propOnDueChange,
  selectedTags: propSelectedTags,
  onTagsChange: propOnTagsChange,
}: AddTaskModalProps) {
  const storeDraft = useTaskDraftStore((s) => s.draft);
  const setDraftField = useTaskDraftStore((s) => s.setDraftField);
  const storeCloseModal = useTaskDraftStore((s) => s.closeModal);

  const title = propTitle !== undefined ? propTitle : storeDraft.title;
  const onTitleChange =
    propOnTitleChange ?? ((v: string) => setDraftField("title", v));

  const description =
    propDescription !== undefined ? propDescription : storeDraft.description;
  const onDescriptionChange =
    propOnDescriptionChange ?? ((v: string) => setDraftField("description", v));

  const priority =
    propPriority !== undefined ? propPriority : storeDraft.priority;
  const onPriorityChange =
    propOnPriorityChange ??
    ((v: Priority | undefined) => setDraftField("priority", v));

  const due = propDue !== undefined ? propDue : (storeDraft.due ?? "");
  const onDueChange =
    propOnDueChange ?? ((v: string) => setDraftField("due", v));

  const selectedTags =
    propSelectedTags !== undefined ? propSelectedTags : storeDraft.tags;
  const onTagsChange =
    propOnTagsChange ?? ((v: string[]) => setDraftField("tags", v));

  const [internalProjectId, setInternalProjectId] = useState(
    defaultProject ?? storeDraft.projectId ?? "Inbox",
  );
  const projectId =
    propProject !== undefined
      ? propProject
      : storeDraft.projectId || internalProjectId;
  const setProjectId =
    propOnProjectChange ??
    ((v: string) => {
      setDraftField("projectId", v);
      setInternalProjectId(v);
    });

  const handleClose = onClose ?? storeCloseModal;

  const settings = useWorkspaceStore((s) => s.settings);
  const workspaceTags = Array.isArray(settings?.tags) ? settings.tags : [];
  const projects = useProjects();
  const availableTags = useAllTags(workspaceTags);
  const allAvailableTags = Array.from(
    new Set([...availableTags, ...selectedTags]),
  ).sort();
  const { isMobile } = useSidebar();
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    if (!trimmedTitle && !trimmedDescription) return;
    onAdd({
      title: trimmedTitle,
      body: trimmedDescription,
      projectId,
      priority,
      due: due || undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
    });
    handleClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      descriptionRef.current?.focus();
    }
  };

  const handleDescriptionKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-5 md:px-6 pt-4 md:pt-5 sr-only">
          <DialogTitle>Add Task</DialogTitle>
        </DialogHeader>

        <div className="px-5 md:px-6 pt-4 md:pt-5 overflow-hidden">
          <Textarea
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Next thing to do"
            rows={1}
            autoFocus
            className="w-full text-xl md:text-xl font-medium leading-7 bg-transparent outline-none resize-none border-0 rounded-none px-0 py-0 min-h-0 placeholder:text-muted-foreground/60"
          />
        </div>

        <div className="px-5 md:px-6 pt-2 flex-1 overflow-y-auto">
          <Textarea
            value={description}
            ref={descriptionRef}
            onChange={(e) => onDescriptionChange(e.target.value)}
            onKeyDown={handleDescriptionKeyDown}
            placeholder="Description"
            rows={2}
            className="w-full text-base md:text-base bg-transparent outline-none resize-none border-0 rounded-none px-0 py-0 min-h-12 placeholder:text-muted-foreground/60"
          />
        </div>

        <div className="px-4 md:px-3 py-3 md:py-4 flex items-center gap-2 md:gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-0 overflow-x-auto [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden">
            <div className="flex w-max items-center gap-0">
              <ProjectSelect
                value={projectId}
                onChange={setProjectId}
                projects={projects}
                variant="inline"
              />

              <DatePicker
                value={due}
                onChange={onDueChange}
                triggerClassName={
                  due ? `h-8 gap-1.5 ${getDueDateColor(due)}` : "h-8"
                }
              />

              <PrioritySelect
                value={priority}
                onChange={onPriorityChange}
                variant="inline"
              />

              <TagSelect
                value={selectedTags}
                onChange={onTagsChange}
                availableTags={allAvailableTags}
                variant="inline"
              />
            </div>
          </div>

          <Button
            aria-label="Add"
            onClick={handleSubmit}
            disabled={!title.trim() && !description.trim()}
            size="sm"
            className="h-8 shrink-0 px-4"
          >
            {isMobile ? <SendHorizontal className="size-5" /> : "Add"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
