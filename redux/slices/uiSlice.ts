import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type TLanguage = "bn" | "en";

type TUiState = {
  sidebarCollapsed: boolean;
  mobileDrawerOpen: boolean;
  language: TLanguage;
  /** Bangla digits are an option, not the default. */
  banglaDigits: boolean;
  /** Academic session chosen in the top bar. Empty means "the current one". */
  selectedSessionId: string;
};

const initialState: TUiState = {
  sidebarCollapsed: false,
  mobileDrawerOpen: false,
  language: "bn",
  banglaDigits: false,
  selectedSessionId: "",
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setMobileDrawer: (state, action: PayloadAction<boolean>) => {
      state.mobileDrawerOpen = action.payload;
    },
    setLanguage: (state, action: PayloadAction<TLanguage>) => {
      state.language = action.payload;
    },
    setBanglaDigits: (state, action: PayloadAction<boolean>) => {
      state.banglaDigits = action.payload;
    },
    setSelectedSession: (state, action: PayloadAction<string>) => {
      state.selectedSessionId = action.payload;
    },
  },
});

export const { toggleSidebar, setMobileDrawer, setLanguage, setBanglaDigits, setSelectedSession } =
  uiSlice.actions;
export const uiReducer = uiSlice.reducer;
