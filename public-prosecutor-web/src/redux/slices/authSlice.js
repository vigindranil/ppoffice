"use client";
import { createSlice } from "@reduxjs/toolkit";
import { encrypt } from "@/utils/crypto";

const initialState = {
  token: null,
  user: null,
};

// Initialize the state in the client environment
if (typeof window !== "undefined") {
  initialState.token = sessionStorage.getItem("token") || null;
  initialState.user = sessionStorage.getItem("user") || null;
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken: (state, action) => {
      const token = action.payload;
      state.token = token;
      if (typeof window !== "undefined") {
        sessionStorage.setItem("token", token);
      }
    },
    setUser: (state, action) => {
      const user = encrypt(action.payload);
      state.user = user;
      if (typeof window !== "undefined") {
        sessionStorage.setItem("user", user);
      }
    },
    clearToken: (state) => {
      state.token = null;
      state.user = null;
      if (typeof window !== "undefined") {
        sessionStorage.clear()
      }
    },
  },
});

export const { setToken, setUser, clearToken } = authSlice.actions;
export default authSlice.reducer;
