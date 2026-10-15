import type { TInvoice } from "./fees";
import type { TPayment } from "./payment";

export type TMyFees = { totalDue: number; invoices: TInvoice[]; receipts: TPayment[] };
