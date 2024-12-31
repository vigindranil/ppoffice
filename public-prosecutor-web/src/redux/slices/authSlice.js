import { createSlice } from "@reduxjs/toolkit";
import { setCookie, getCookie, removeCookie } from "@/utils/cookie";
import { encrypt } from "@/utils/crypto";

const initialState = {
  token: getCookie("token") || null, // Decrypt token from cookies
  user: getCookie("user") || null,   // Decrypt user from cookies
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken: (state, action) => {
      const token = encrypt(action.payload);
      state.token = token;
      setCookie("token", token, { maxAge: 3600 }); // Store in cookies with 1-hour expiry
    },
    setUser: (state, action) => {
      const user = encrypt(action.payload);
      state.user = user;
      setCookie("user", user, { maxAge: 3600 }); // Store in cookies with 1-hour expiry
    },
    clearToken: (state) => {
      state.token = null;
      state.user = null;
      removeCookie("token");
      removeCookie("user");
    },
  },
});

export const { setToken, setUser, clearToken } = authSlice.actions;
export default authSlice.reducer;
