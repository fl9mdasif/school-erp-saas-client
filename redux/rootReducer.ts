import { baseApi } from "./api/baseApi";
import { authReducer } from "./slices/authSlice";
import { uiReducer } from "./slices/uiSlice";

export const reducer = {
  [baseApi.reducerPath]: baseApi.reducer,
  auth: authReducer,
  ui: uiReducer,
};
