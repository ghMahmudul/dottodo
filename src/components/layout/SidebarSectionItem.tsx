import { type LucideIcon, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ProjectContextMenu from "./ProjectContextMenu";
import { sidebarItemState } from "./sidebar-item";

export interface SidebarSectionItemProps {
  name: string;
  icon: LucideIcon;
  count?: number;
  isActive: boolean;
  onClick: () => void;
  onEdit?: () => void;
  onRename?: () => void;
  onDelete: () => void;
  className?: string;
}

export default function SidebarSectionItem({
  name,
  icon: Icon,
  count,
  isActive,
  onClick,
  onEdit,
  onRename,
  onDelete,
  className,
}: SidebarSectionItemProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const handleEdit = onEdit || onRename;

  return (
    <div className={cn("group relative flex items-center", className)}>
      <Button
        variant="ghost"
        onClick={onClick}
        className={cn(
          "w-full justify-start gap-2 pl-3 pr-9 py-2 h-auto min-h-9 text-sm rounded-lg",
          sidebarItemState(isActive),
          !isActive && "group-hover:bg-sidebar-accent",
          menuOpen && !isActive && "bg-sidebar-accent text-sidebar-foreground",
        )}
      >
        <Icon className="size-4 shrink-0" />
        <span className="flex-1 text-left truncate">{name}</span>
      </Button>
      <div className="absolute right-1 top-1/2 -translate-y-1/2 flex size-8 shrink-0 items-center justify-center pointer-events-none">
        {count !== undefined && count > 0 && (
          <span
            className={cn(
              "text-xs tabular-nums text-muted-foreground transition-opacity duration-150",
              menuOpen
                ? "opacity-0"
                : "group-hover:opacity-0 focus-within:opacity-0",
            )}
          >
            {count}
          </span>
        )}
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center transition-opacity duration-150",
            menuOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto focus-within:opacity-100 focus-within:pointer-events-auto",
          )}
        >
          <ProjectContextMenu
            open={menuOpen}
            onOpenChange={setMenuOpen}
            onEdit={handleEdit}
            onDelete={onDelete}
          >
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Options for ${name}`}
              className={cn(
                "size-7 rounded-full text-sidebar-foreground hover:text-sidebar-foreground hover:bg-sidebar-foreground/10 active:bg-sidebar-foreground/10 aria-expanded:bg-sidebar-foreground/10",
                menuOpen && "bg-sidebar-foreground/10 text-sidebar-foreground",
              )}
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </ProjectContextMenu>
        </div>
      </div>
    </div>
  );
}
