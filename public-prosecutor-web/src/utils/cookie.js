import Cookies from "universal-cookie";

const cookies = new Cookies();

export const setCookie = (key, value, options = {}) => {
  cookies.set(key, value, {
    path: "/", // Default path
    secure: true, // Use secure cookies in production
    sameSite: "strict", // CSRF protection
    ...options, // Allow custom options
  });
};

export const getCookie = (key) => cookies.get(key);

export const removeCookie = (key) => cookies.remove(key, { path: "/" });
