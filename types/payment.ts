export type TPaymentMethod = "cash" | "bank" | "cheque" | "bkash_manual" | "nagad_manual" | "rocket_manual";
export type TPaymentStatus = "succeeded" | "reversed";

export type TPaymentAllocation = { invoiceId: string; amount: number };

export type TPayment = {
  _id: string;
  receiptNo: string;
  studentId: string | { _id: string; name: string; studentId: string };
  allocations: TPaymentAllocation[];
  amount: number;
  method: TPaymentMethod;
  status: TPaymentStatus;
  providerRef?: string;
  note?: string;
  receivedAt: string;
  reversedAt?: string;
  reversalReason?: string;
};

export type TPaymentInput = {
  studentId: string;
  amount: number;
  method: TPaymentMethod;
  allocations?: TPaymentAllocation[];
  providerRef?: string;
  note?: string;
};
