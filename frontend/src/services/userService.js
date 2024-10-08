import axios from "../utils/axios";

export const login = async (data) => {
  return axios.post("/users/login", data);
};

export const signup = async (data) => {
  return axios.post("/users/signup", data);
};

export const logout = async () => {
  return axios.post("/users/logout");
};

export const getAllUsers = async () => {
  return axios.get("/users");
};

export const getUserById = async (id) => {
  return axios.get(`/users/${id}`);
};

export const deleteUserById = async (id) => {
  return axios.delete(`/users/${id}`);
};

export const updateUserById = async (id, update) => {
  return axios.patch(`/users/${id}`, update);
};

export const checkAuthStatus = async () => {
  return axios.get("/users/check-auth");
};



export const checkCookie = async () => {
  try {
    const response = await axios.get("/users/check-cookie");
    return response.data.isValid;
  } catch (error) {
    console.error("Error checking auth cookie:", error.message);
    return false;
  }
};
