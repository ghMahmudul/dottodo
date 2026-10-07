import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_SETTINGS } from "@/core/types";
import { useUIStore } from "@/store/ui-store";
import { useWorkspaceStore } from "@/store/workspace-store";
import Sidebar from "../layout/Sidebar";

const mockNavigate = vi.fn();
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: "/all" }),
  };
});

describe("Sidebar", () => {
  const defaultProps = {
    onSettingsClick: vi.fn(),
    onSearchClick: vi.fn(),
    onToggleSidebar: vi.fn(),
    onAddProjectClick: vi.fn(),
    onRenameProject: vi.fn(),
    onDeleteProject: vi.fn(),
    onAddTagClick: vi.fn(),
    onRenameTag: vi.fn(),
    onDeleteTag: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useWorkspaceStore.setState({
      workspaceName: "My Workspace",
      workspaces: [{ id: "ws-1", name: "My Workspace", mode: "local-storage" }],
      currentWorkspaceId: "ws-1",
      mode: "local-storage",
    });
  });

  it("navigates to /workspaces when clicking Manage Workspaces in the dropdown", async () => {
    const user = userEvent.setup();
    render(<Sidebar {...defaultProps} />);

    const trigger = screen.getByRole("button", { name: /My Workspace/i });
    const chevronIcon = trigger.querySelector("svg");
    expect(chevronIcon).toHaveClass("size-4");
    await user.click(trigger);

    await waitFor(() => {
      expect(
        screen.getByRole("menuitem", { name: /Manage Workspaces/i }),
      ).toBeInTheDocument();
    });

    const manageBtn = screen.getByRole("menuitem", {
      name: /Manage Workspaces/i,
    });
    const manageIcon = manageBtn.querySelector("svg");
    expect(manageIcon).toHaveClass("size-4");
    await user.click(manageBtn);

    expect(mockNavigate).toHaveBeenCalledWith("/workspaces");
  });

  it("closes mobile sidebar when clicking Manage Workspaces on mobile screen", async () => {
    useUIStore.setState({ mobileSidebarOpen: true });

    const user = userEvent.setup();
    render(<Sidebar {...defaultProps} />);

    const trigger = screen.getByRole("button", { name: /My Workspace/i });
    await user.click(trigger);

    await waitFor(() => {
      expect(
        screen.getByRole("menuitem", { name: /Manage Workspaces/i }),
      ).toBeInTheDocument();
    });

    const manageBtn = screen.getByRole("menuitem", {
      name: /Manage Workspaces/i,
    });
    await user.click(manageBtn);

    expect(mockNavigate).toHaveBeenCalledWith("/workspaces");
    expect(useUIStore.getState().mobileSidebarOpen).toBe(false);
  });

  it("navigates to the switched workspace's default view when selected from the dropdown", async () => {
    const user = userEvent.setup();
    const switchWorkspace = vi.fn().mockImplementation(async () => {
      useWorkspaceStore.setState({
        settings: {
          ...useWorkspaceStore.getState().settings,
          defaultView: "today",
        },
      });
      return { listFiles: vi.fn().mockResolvedValue([]) };
    });

    useWorkspaceStore.setState({
      workspaceName: "Workspace 1",
      workspaces: [
        { id: "ws-1", name: "Workspace 1", mode: "local-storage" },
        { id: "ws-2", name: "Workspace 2", mode: "local-storage" },
      ],
      currentWorkspaceId: "ws-1",
      mode: "local-storage",
      switchWorkspace,
    });

    render(<Sidebar {...defaultProps} />);

    const trigger = screen.getByRole("button", { name: /Workspace 1/i });
    await user.click(trigger);

    await waitFor(() => {
      expect(
        screen.getByRole("menuitem", { name: /Workspace 2/i }),
      ).toBeInTheDocument();
    });

    const ws2Item = screen.getByRole("menuitem", { name: /Workspace 2/i });
    await user.click(ws2Item);

    expect(switchWorkspace).toHaveBeenCalledWith("ws-2");
    expect(mockNavigate).toHaveBeenCalledWith("/today");
  });

  it("renders Completed, Archived, and Trash views by default", () => {
    render(<Sidebar {...defaultProps} />);

    expect(
      screen.getByRole("button", { name: /^completed/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^archived/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^trash/i })).toBeInTheDocument();
  });

  it("hides Completed, Archived, and Trash views when disabled in settings", () => {
    useWorkspaceStore.setState({
      settings: {
        ...DEFAULT_SETTINGS,
        showCompleted: false,
        showArchived: false,
        showTrash: false,
      },
    });
    render(<Sidebar {...defaultProps} />);

    expect(
      screen.queryByRole("button", { name: /^completed/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /^archived/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /^trash/i }),
    ).not.toBeInTheDocument();
  });
});
