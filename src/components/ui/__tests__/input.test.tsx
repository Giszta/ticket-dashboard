import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "@/components/ui/input";

describe("Input", () => {
  it("renders with label", () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
  });

  it("shows error message when error prop is provided", () => {
    render(<Input label="Email" error="Email is required" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Email is required");
    expect(screen.getByLabelText(/email/i)).toHaveAttribute("aria-invalid", "true");
  });

  it("shows hint when hint prop provided and no error", () => {
    render(<Input label="Email" hint="We will never share your email" />);
    expect(screen.getByText(/never share/i)).toBeInTheDocument();
  });

  it("does not show hint when error is present", () => {
    render(<Input label="Email" hint="Hint text" error="Error text" />);
    expect(screen.queryByText("Hint text")).not.toBeInTheDocument();
    expect(screen.getByText("Error text")).toBeInTheDocument();
  });

  it("shows required asterisk when required", () => {
    render(<Input label="Name" required />);
    // Gwiazdka jest aria-hidden, ale jest w DOM
    const label = screen.getByText("Name").parentElement;
    expect(label?.textContent).toContain("*");
  });

  it("accepts user input", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<Input label="Name" onChange={onChange} />);
    await user.type(screen.getByLabelText(/name/i), "John");

    expect(onChange).toHaveBeenCalled();
  });

  it("is disabled when disabled prop is true", () => {
    render(<Input label="Name" disabled />);
    expect(screen.getByLabelText(/name/i)).toBeDisabled();
  });

  it("forwards ref correctly", () => {
    const ref = vi.fn();
    render(<Input label="Name" ref={ref} />);
    expect(ref).toHaveBeenCalled();
  });
});
