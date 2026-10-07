import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DatePicker } from "@/components/ui/date-picker";

describe("DatePicker", () => {
  it("renders with 16px (size-4) calendar icon by default", () => {
    const { container } = render(
      <DatePicker value="" onChange={vi.fn()} placeholder="Date" />,
    );

    const button = screen.getByRole("button", { name: /date/i });
    expect(button).toBeInTheDocument();

    const icon = container.querySelector("svg");
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass("size-4");
  });

  it("allows custom iconClassName", () => {
    const { container } = render(
      <DatePicker
        value=""
        onChange={vi.fn()}
        placeholder="Date"
        iconClassName="size-5 text-primary"
      />,
    );

    const icon = container.querySelector("svg");
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass("size-5", "text-primary");
  });

  it("displays formatted date when value is provided", () => {
    render(<DatePicker value="2026-03-20" onChange={vi.fn()} />);

    expect(screen.getByText("Mar 20")).toBeInTheDocument();
  });

  it("calls onChange when a quick option is selected", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<DatePicker value="" onChange={onChange} placeholder="Date" />);

    await user.click(screen.getByRole("button", { name: /date/i }));

    const todayButton = await screen.findByText("Today");
    expect(todayButton).toBeInTheDocument();

    await user.click(todayButton);
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
