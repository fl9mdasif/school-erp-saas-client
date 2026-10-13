import { fireEvent, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { DataTable, type TColumn } from "@/components/common/DataTable";
import { MoneyInput } from "@/components/common/MoneyInput";
import { StatusChip } from "@/components/common/StatusChip";
import { renderWithStore } from "./utils/render";

type Row = { id: string; name: string };
const columns: TColumn<Row>[] = [{ key: "name", header: "Name", cell: (r) => r.name }];

describe("DataTable", () => {
  it("shows a skeleton while loading, never a blank page", () => {
    renderWithStore(<DataTable columns={columns} loading rowKey={(r) => r.id} emptyTitle="None" />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
  it("shows the empty state with its action", () => {
    renderWithStore(
      <DataTable columns={columns} rows={[]} rowKey={(r) => r.id} emptyTitle="No students yet" emptyAction={<button>Add student</button>} />
    );
    expect(screen.getByText("No students yet")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add student" })).toBeInTheDocument();
  });
  it("shows the error state with a retry that works", () => {
    const retry = vi.fn();
    renderWithStore(
      <DataTable columns={columns} error={{ status: 500, code: "NETWORK_ERROR", message: "x" }} onRetry={retry} rowKey={(r) => r.id} emptyTitle="None" />
    );
    expect(screen.getByRole("alert")).toHaveTextContent("No connection");
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(retry).toHaveBeenCalled();
  });
  it("renders rows and pages through the server meta", () => {
    const onPage = vi.fn();
    renderWithStore(
      <DataTable
        columns={columns}
        rows={[{ id: "1", name: "Rahim" }]}
        meta={{ page: 2, limit: 20, total: 45 }}
        onPageChange={onPage}
        rowKey={(r) => r.id}
        emptyTitle="None"
      />
    );
    expect(screen.getAllByText("Rahim").length).toBeGreaterThan(0);
    expect(screen.getByText("Page 2 of 3")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Next/ }));
    expect(onPage).toHaveBeenCalledWith(3);
    fireEvent.click(screen.getByRole("button", { name: /Previous/ }));
    expect(onPage).toHaveBeenCalledWith(1);
  });
});

describe("MoneyInput", () => {
  it("takes Taka and gives poisha", () => {
    const Harness = () => {
      const [v, setV] = useState<number | null>(null);
      return (
        <>
          <MoneyInput aria-label="amount" value={v} onChange={setV} />
          <output data-testid="poisha">{v === null ? "none" : v}</output>
        </>
      );
    };
    renderWithStore(<Harness />);
    const input = screen.getByLabelText("amount");
    fireEvent.change(input, { target: { value: "1250.5" } });
    expect(screen.getByTestId("poisha")).toHaveTextContent("125050");
    fireEvent.change(input, { target: { value: "12.345" } }); // third decimal is ignored
    expect(screen.getByTestId("poisha")).toHaveTextContent("125050");
    fireEvent.change(input, { target: { value: "" } });
    expect(screen.getByTestId("poisha")).toHaveTextContent("none");
  });
});

describe("ConfirmDialog", () => {
  it("keeps the strong confirm disabled until the exact text is typed", () => {
    const onConfirm = vi.fn();
    renderWithStore(
      <ConfirmDialog open onOpenChange={() => {}} title="Publish" confirmLabel="Publish now" typedConfirmText="Half Yearly" onConfirm={onConfirm} />
    );
    const button = screen.getByRole("button", { name: "Publish now" });
    expect(button).toBeDisabled();
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Half Yearly" } });
    expect(button).toBeEnabled();
    fireEvent.click(button);
    expect(onConfirm).toHaveBeenCalled();
  });
});

describe("StatusChip", () => {
  it("always carries a word, never colour alone", () => {
    renderWithStore(<StatusChip tone="destructive">Absent</StatusChip>);
    expect(screen.getByText("Absent")).toBeInTheDocument();
  });
});
