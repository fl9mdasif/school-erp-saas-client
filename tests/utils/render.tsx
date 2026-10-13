import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { store } from "@/redux/store";
import { setLanguage } from "@/redux/slices/uiSlice";
import type { TLang } from "@/lib/i18n";

/** Renders a component inside the real Redux store, in the chosen language. */
export const renderWithStore = (ui: React.ReactElement, lang: TLang = "en") => {
  store.dispatch(setLanguage(lang));
  return render(<Provider store={store}>{ui}</Provider>);
};
