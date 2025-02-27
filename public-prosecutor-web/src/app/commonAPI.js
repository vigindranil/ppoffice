const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const clearUserData = (dispatch) => {
  dispatch({ type: "CLEAR_USER_DATA" }); // Clearing user details from Redux
};

export const postRequest = async (url, request_body = {}, dispatch) => {
  try {
    const authToken = sessionStorage.getItem("token");
    const HEADERS = {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    };
    
    const requestOptions = {
      method: "POST",
      headers: new Headers(HEADERS),
      body: JSON.stringify(request_body),
      redirect: "follow",
    };

    const response = await fetch(`${BASE_URL}${url}`, requestOptions);

    if (response.status === 401 || response.status === 403) {
      clearUserData(dispatch);
      window.location.href = "/unauthorized";
    } else if (!response.ok) {
      throw new Error(response);
    } else {
      return await response.json();
    }
  } catch (error) {
    throw error;
  }
};

export const logout = async (dispatch) => {
  try {
    const authToken = sessionStorage.getItem("token");
    const HEADERS = {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    };

    const requestOptions = {
      method: "POST",
      headers: new Headers(HEADERS),
      body: JSON.stringify({}),
      redirect: "follow",
    };

    const response = await fetch(`${BASE_URL}user/logout`, requestOptions);
    clearUserData(dispatch);
    window.location.href = response.status === 401 || response.status === 403 ? "/session-expired" : "/";
  } catch (error) {
    console.log(error);
    clearUserData(dispatch);
    window.location.href = "/";
  }
};

export const getRequest = async (url, dispatch) => {
  try {
    const authToken = sessionStorage.getItem("token");
    const HEADERS = { Authorization: `Bearer ${authToken}` };
    const requestOptions = { headers: new Headers(HEADERS), redirect: "follow" };

    const response = await fetch(`${BASE_URL}${url}`, requestOptions);

    if (response.status === 401 || response.status === 403) {
      clearUserData(dispatch);
      window.location.href = "/session-expired";
    } else if (!response.ok) {
      throw new Error(response);
    } else {
      return await response.json();
    }
  } catch (error) {
    throw error;
  }
};

export const postFileRequest = async (url, request_body, dispatch) => {
  try {
    const authToken = sessionStorage.getItem("token");
    const formData = new FormData();
    for (const key in request_body) {
      formData.append(key, request_body[key]);
    }
    const HEADERS = { Authorization: `Bearer ${authToken}` };

    const requestOptions = {
      method: "POST",
      headers: new Headers(HEADERS),
      body: formData,
      redirect: "follow",
    };

    const response = await fetch(`${BASE_URL}${url}`, requestOptions);

    if (response.status === 401 || response.status === 403) {
      clearUserData(dispatch);
      window.location.href = "/session-expired";
    } else if (!response.ok) {
      return await response.json();
    } else {
      return await response.json();
    }
  } catch (error) {
    console.log(error.message);
    throw error;
  }
};