import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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

  describe("shortcuts in title field", () => {
    it("shows shortcut options dropdown when typing '/' in order: Date, Priority, Project, Tag", () => {
      render(<AddTaskModal {...defaultProps} title="" />);
      const titleInput = screen.getByPlaceholderText("Next thing to do");

      fireEvent.change(titleInput, { target: { value: "/", selectionEnd: 1 } });

      expect(screen.getByRole("listbox")).toBeInTheDocument();
      const options = screen.getAllByRole("option");
      expect(options.map((opt) => opt.textContent)).toEqual([
        "Date",
        "Priority",
        "Project",
        "Tag",
      ]);
    });

    it("selecting Priority from '/' menu replaces '/' with '!' and opens Priority dropdown", () => {
      const onTitleChange = vi.fn();
      render(
        <AddTaskModal
          {...defaultProps}
          title=""
          onTitleChange={onTitleChange}
        />,
      );
      const titleInput = screen.getByPlaceholderText("Next thing to do");

      fireEvent.change(titleInput, { target: { value: "/", selectionEnd: 1 } });

      const priorityOption = screen.getByText("Priority");
      fireEvent.click(priorityOption);

      expect(onTitleChange).toHaveBeenCalledWith("!");
      expect(screen.getByText("High")).toBeInTheDocument();
      expect(screen.getByText("Medium")).toBeInTheDocument();
      expect(screen.getByText("Low")).toBeInTheDocument();
    });

    it("shows priority options directly when typing '!' and selects priority", () => {
      const onTitleChange = vi.fn();
      const onPriorityChange = vi.fn();
      render(
        <AddTaskModal
          {...defaultProps}
          title=""
          onTitleChange={onTitleChange}
          onPriorityChange={onPriorityChange}
        />,
      );
      const titleInput = screen.getByPlaceholderText("Next thing to do");

      fireEvent.change(titleInput, {
        target: { value: "Task !", selectionEnd: 6 },
      });

      const highOption = screen.getByText("High");
      expect(highOption).toBeInTheDocument();
      fireEvent.click(highOption);

      expect(onPriorityChange).toHaveBeenCalledWith("high");
      expect(onTitleChange).toHaveBeenCalledWith("Task ");
    });

    it("shows date options when typing '*' and sets due date", () => {
      const onTitleChange = vi.fn();
      const onDueChange = vi.fn();
      render(
        <AddTaskModal
          {...defaultProps}
          title=""
          onTitleChange={onTitleChange}
          onDueChange={onDueChange}
        />,
      );
      const titleInput = screen.getByPlaceholderText("Next thing to do");

      fireEvent.change(titleInput, { target: { value: "*", selectionEnd: 1 } });

      const todayOption = screen.getByText("Today");
      expect(todayOption).toBeInTheDocument();
      expect(screen.queryByText(/Pick Date/i)).not.toBeInTheDocument();
      fireEvent.click(todayOption);

      expect(onDueChange).toHaveBeenCalled();
      expect(onTitleChange).toHaveBeenCalledWith("");
    });

    it("shows project options when typing '+' and sets project", () => {
      const onTitleChange = vi.fn();
      const onProjectChange = vi.fn();
      render(
        <AddTaskModal
          {...defaultProps}
          title=""
          onTitleChange={onTitleChange}
          onProjectChange={onProjectChange}
        />,
      );
      const titleInput = screen.getByPlaceholderText("Next thing to do");

      fireEvent.change(titleInput, { target: { value: "+", selectionEnd: 1 } });

      const projectOption = screen.getByText("Project Alpha");
      expect(projectOption).toBeInTheDocument();
      fireEvent.click(projectOption);

      expect(onProjectChange).toHaveBeenCalledWith("Project Alpha");
      expect(onTitleChange).toHaveBeenCalledWith("");
    });

    it("shows 'Create Project \"projectName\"' option when typing a new project after '+'", async () => {
      const onTitleChange = vi.fn();
      const onProjectChange = vi.fn();
      const onCreateProject = vi.fn().mockResolvedValue(undefined);
      render(
        <AddTaskModal
          {...defaultProps}
          title=""
          onTitleChange={onTitleChange}
          onProjectChange={onProjectChange}
          onCreateProject={onCreateProject}
        />,
      );
      const titleInput = screen.getByPlaceholderText("Next thing to do");

      fireEvent.change(titleInput, {
        target: { value: "+Beta", selectionEnd: 5 },
      });

      const createOption = screen.getByText('Create Project "Beta"');
      expect(createOption).toBeInTheDocument();
      fireEvent.click(createOption);

      await waitFor(() => {
        expect(onCreateProject).toHaveBeenCalledWith("Beta");
        expect(onProjectChange).toHaveBeenCalledWith("Beta");
        expect(onTitleChange).toHaveBeenCalledWith("");
      });
    });

    it("shows tag options when typing '#' and sets tag", () => {
      const onTitleChange = vi.fn();
      const onTagsChange = vi.fn();
      render(
        <AddTaskModal
          {...defaultProps}
          title=""
          onTitleChange={onTitleChange}
          onTagsChange={onTagsChange}
        />,
      );
      const titleInput = screen.getByPlaceholderText("Next thing to do");

      fireEvent.change(titleInput, { target: { value: "#", selectionEnd: 1 } });

      const tagOption = screen.getByText("work");
      expect(tagOption).toBeInTheDocument();
      fireEvent.click(tagOption);

      expect(onTagsChange).toHaveBeenCalledWith(["work"]);
      expect(onTitleChange).toHaveBeenCalledWith("");
    });

    it("shows 'Create Tag \"tagName\"' option when typing a new tag after '#'", () => {
      const onTitleChange = vi.fn();
      const onTagsChange = vi.fn();
      render(
        <AddTaskModal
          {...defaultProps}
          title=""
          onTitleChange={onTitleChange}
          onTagsChange={onTagsChange}
        />,
      );
      const titleInput = screen.getByPlaceholderText("Next thing to do");

      fireEvent.change(titleInput, {
        target: { value: "#custom", selectionEnd: 7 },
      });

      const createOption = screen.getByText('Create Tag "custom"');
      expect(createOption).toBeInTheDocument();
      fireEvent.click(createOption);

      expect(onTagsChange).toHaveBeenCalledWith(["custom"]);
      expect(onTitleChange).toHaveBeenCalledWith("");
    });

    it("closes shortcut dropdown on Escape without closing modal", () => {
      const onClose = vi.fn();
      render(<AddTaskModal {...defaultProps} title="" onClose={onClose} />);
      const titleInput = screen.getByPlaceholderText("Next thing to do");

      fireEvent.change(titleInput, { target: { value: "!", selectionEnd: 1 } });
      expect(screen.getByRole("listbox")).toBeInTheDocument();

      fireEvent.keyDown(titleInput, { key: "Escape" });

      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
      expect(onClose).not.toHaveBeenCalled();
    });

    it("navigates options with ArrowDown and selects with Enter", () => {
      const onPriorityChange = vi.fn();
      render(
        <AddTaskModal
          {...defaultProps}
          title=""
          onPriorityChange={onPriorityChange}
        />,
      );
      const titleInput = screen.getByPlaceholderText("Next thing to do");

      fireEvent.change(titleInput, { target: { value: "!", selectionEnd: 1 } });
      expect(screen.getByRole("listbox")).toBeInTheDocument();

      // Navigate down to Medium (index 1)
      fireEvent.keyDown(titleInput, { key: "ArrowDown" });
      fireEvent.keyDown(titleInput, { key: "Enter" });

      expect(onPriorityChange).toHaveBeenCalledWith("medium");
    });

    it("does not render check icon on any option in the shortcut dropdown", () => {
      render(
        <AddTaskModal
          {...defaultProps}
          title=""
          priority="high"
          project="Inbox"
        />,
      );
      const titleInput = screen.getByPlaceholderText("Next thing to do");

      fireEvent.change(titleInput, { target: { value: "!", selectionEnd: 1 } });
      const listbox = screen.getByRole("listbox");
      expect(listbox).toBeInTheDocument();
      expect(listbox.querySelector(".lucide-check")).toBeNull();

      fireEvent.change(titleInput, { target: { value: "+", selectionEnd: 1 } });
      const projectListbox = screen.getByRole("listbox");
      expect(projectListbox).toBeInTheDocument();
      expect(projectListbox.querySelector(".lucide-check")).toBeNull();
    });
  });
});
