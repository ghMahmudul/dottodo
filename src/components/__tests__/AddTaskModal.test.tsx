import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AddTaskModal from "../task/AddTaskModal";

vi.mock("../../store/task-store", () => ({
  useTaskStore: (selector: (state: unknown) => unknown) =>
    selector({
      getProjects: () => ["Project Alpha"],
      getAllTags: () => ["work"],
    }),
  useProjects: () => ["Project Alpha"],
  useAllTags: () => ["work"],
}));

vi.mock("../layout/Layout", () => ({
  useSidebar: () => ({ isMobile: false }),
}));

describe("AddTaskModal", () => {
  const defaultProps = {
    onClose: vi.fn(),
    onAdd: vi.fn(),
    defaultProject: "inbox",
    title: "New Todo",
    onTitleChange: vi.fn(),
    description: "Some description",
    onDescriptionChange: vi.fn(),
    due: "",
    onDueChange: vi.fn(),
    selectedTags: [],
    onTagsChange: vi.fn(),
    onPriorityChange: vi.fn(),
  };

  it("renders title and description inputs", () => {
    render(<AddTaskModal {...defaultProps} />);

    expect(screen.getByPlaceholderText("Next thing to do")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Description")).toBeInTheDocument();
  });

  it("submits task on Enter in the title input", () => {
    const onAdd = vi.fn();
    const onClose = vi.fn();
    render(<AddTaskModal {...defaultProps} onAdd={onAdd} onClose={onClose} />);

    const titleInput = screen.getByPlaceholderText("Next thing to do");
    fireEvent.keyDown(titleInput, { key: "Enter", shiftKey: false });

    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "New Todo",
        body: "Some description",
      }),
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not submit on plain Enter in description input", () => {
    const onAdd = vi.fn();
    const onClose = vi.fn();
    render(<AddTaskModal {...defaultProps} onAdd={onAdd} onClose={onClose} />);

    const descInput = screen.getByPlaceholderText("Description");
    fireEvent.keyDown(descInput, { key: "Enter", shiftKey: false });

    expect(onAdd).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("submits task on Ctrl+Enter in the description input", () => {
    const onAdd = vi.fn();
    const onClose = vi.fn();
    render(<AddTaskModal {...defaultProps} onAdd={onAdd} onClose={onClose} />);

    const descInput = screen.getByPlaceholderText("Description");
    fireEvent.keyDown(descInput, { key: "Enter", ctrlKey: true });

    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "New Todo",
        body: "Some description",
      }),
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("submits task on Cmd+Enter (metaKey) in the description input", () => {
    const onAdd = vi.fn();
    const onClose = vi.fn();
    render(<AddTaskModal {...defaultProps} onAdd={onAdd} onClose={onClose} />);

    const descInput = screen.getByPlaceholderText("Description");
    fireEvent.keyDown(descInput, { key: "Enter", metaKey: true });

    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("submits if title is empty but description is provided", () => {
    const onAdd = vi.fn();
    const onClose = vi.fn();
    render(
      <AddTaskModal
        {...defaultProps}
        title="   "
        description="Some description"
        onAdd={onAdd}
        onClose={onClose}
      />,
    );

    const descInput = screen.getByPlaceholderText("Description");
    fireEvent.keyDown(descInput, { key: "Enter", ctrlKey: true });

    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "",
        body: "Some description",
      }),
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not submit if both title and description are empty", () => {
    const onAdd = vi.fn();
    const onClose = vi.fn();
    render(
      <AddTaskModal
        {...defaultProps}
        title="   "
        description="   "
        onAdd={onAdd}
        onClose={onClose}
      />,
    );

    const descInput = screen.getByPlaceholderText("Description");
    fireEvent.keyDown(descInput, { key: "Enter", ctrlKey: true });

    expect(onAdd).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });
});
