import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TicketsPagination } from "@/features/tickets/tickets-pagination";

// useRouter już jest zmockowany w setup.ts

describe("TicketsPagination", () => {
  const defaultProps = {
    currentPage: 1,
    totalPages: 5,
    totalCount: 100,
    pageSize: 20,
  };

  it("renders pagination when totalPages > 1", () => {
    render(<TicketsPagination {...defaultProps} />);
    expect(screen.getByRole("navigation", { name: /pagination/i })).toBeInTheDocument();
  });

  it("does not render when totalPages <= 1", () => {
    render(<TicketsPagination {...defaultProps} totalPages={1} />);
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });

  it("shows correct result range", () => {
    render(<TicketsPagination {...defaultProps} />);

    // Szukamy całego zdania zamiast pojedynczych liczb
    expect(screen.getByText(/showing/i)).toBeInTheDocument();

    // Szukamy w kontekście paragrafu — nie globalnie
    const info = screen.getByText(/showing/i).closest("p");
    expect(info).toHaveTextContent("1");
    expect(info).toHaveTextContent("20");
    expect(info).toHaveTextContent("100");
  });

  it("previous button is disabled on first page", () => {
    render(<TicketsPagination {...defaultProps} currentPage={1} />);
    expect(screen.getByRole("button", { name: /previous/i })).toBeDisabled();
  });

  it("next button is disabled on last page", () => {
    render(<TicketsPagination {...defaultProps} currentPage={5} totalPages={5} />);
    expect(screen.getByRole("button", { name: /next/i })).toBeDisabled();
  });

  it("highlights current page button", () => {
    render(<TicketsPagination {...defaultProps} currentPage={3} />);
    const page3Button = screen.getByRole("button", { name: /page 3/i });
    expect(page3Button).toHaveAttribute("aria-current", "page");
    expect(page3Button).toHaveClass("bg-blue-600");
  });

  it("shows ellipsis for large page counts", () => {
    render(
      <TicketsPagination {...defaultProps} currentPage={5} totalPages={20} totalCount={400} />,
    );
    // Powinny być dwa "…" — przed i po aktualnej stronie
    const ellipses = screen.getAllByText("…");
    expect(ellipses.length).toBe(2);
  });
});
