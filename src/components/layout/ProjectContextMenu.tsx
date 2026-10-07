import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface ProjectContextMenuProps {
  children: React.ReactElement;
  onEdit?: () => void;
  onRename?: () => void;
  onDelete: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  align?: "start" | "end" | "center";
}

export default function ProjectContextMenu({
  children,
  onEdit,
  onRename,
  onDelete,
  open,
  onOpenChange,
  align = "end",
}: ProjectContextMenuProps) {
  const handleEdit = onEdit || onRename;

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger
        render={children}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      />
      <DropdownMenuContent align={align} className="w-40">
        {handleEdit && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              handleEdit();
            }}
          >
            Edit
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          variant="destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
