import React, { useEffect } from "react";
import { Outlet, redirect, useNavigate } from "react-router-dom";

export const AuthContext = React.createContext();
export default function useAuth ()
{
  return React.useContext(AuthContext);
}

export function isLogged (identity)
{
  return 'univID' in identity || "email" in identity;
}

/* Reset identity and Send username and password to the server.
   Action of /account/login form.  */
export const login =
  ({ apiClient, setIdentity }) =>
  async ({ request }) => {
    try {
      console.debug("account/login action called");
      setIdentity({});
      const formData = await request.formData();
      const body = Object.fromEntries(formData);
      const res = await apiClient.post("/api/auth/login", body);
      if (res.data && typeof res.data === "object") {
        let newIdentity = {};
        if ("univID" in res.data) newIdentity.univID = res.data.univID;
        if ("email" in res.data) newIdentity.email = res.data.email;
        if ("id" in res.data) newIdentity.id = res.data.id;

        if (newIdentity?.univID || newIdentity?.email || newIdentity?.id)
          setIdentity(newIdentity);
      }
      return redirect("/");
    } catch (error) {
      console.error ("error in login action", error)
      return error.response;
    }
  };

/* Disconnect the user and erase notify the server.
   Action of /account/logout button  */
export const logout =
  ({ apiClient, setIdentity }) =>
  async () => {
    try {
      await apiClient.get("/api/auth/logout");
      setIdentity({});
      return redirect("/profile");
    } catch (error) {
      console.error("logout action failed with", error);
      return Promise.reject(error.response);
    }
  };

/* Create a new account and automatically log into it.
   Action of /account/signup form.  */
export const signup =
  ({ apiClient, setIdentity }) =>
  async ({ request }) => {
    try {
      setIdentity({});
      const formData = await request.formData();
      const userInfos = Object.fromEntries(formData);
      const response = await apiClient.post("/api/auth", userInfos);
      return response.data;
    } catch (error) {
      console.error("account/signup action failed with", error);
      return Promise.reject(error.response);
    }
  };

/* Refresh the current user local identity from the server.  */
export const getIdentity =
  ({ apiClient }) =>
  async () => {
    try {
      const response = await apiClient.get("/api/users");
      console.debug("'getIdentity' response is", response);
      return response.data;
    } catch (error) {
      console.error("getIdentity failed with", error);
      return Promise.reject(error.response);
    }
  };

/* Action of /profile/edit
   Update the current user profile on the server.  */
export const updateProfile =
  ({ apiClient }) =>
  async ({ request, params }) => {
    try {
      const formData = await request.formData ();
      const updates = Object.fromEntries(formData);
      await apiClient.put("/api/users", updates);
      return redirect("/profile", { replace: true });
    } catch (error) {
      console.error("update failed with", error);
      return Promise.reject(error.response);
    }
  };

/* Checks the user is still authentified as they navigate.  */
// function checkAuth() {
//   return "univID" in identity || "email" in identity || "id" in identity;
// }

export function AuthLayout({ apiClient, setIdentity }) {
  const navigate = useNavigate();

  useEffect(() => {
    const requestInterceptor = apiClient.interceptors.request.use((config) => {
      if (typeof config.data === FormData) {
        let object = {};
        config.data.forEach((value, key) => (object[key] = value));
        config.data = JSON.stringify(object);
      }
      return config;
    });

    const responseInterceptor = apiClient.interceptors.response.use(
      (res) => {
        return res;
      },
      (err) => {
        if (err.status == 401 || err.status == 403) {
          setIdentity({});
          return navigate("/account/login", { replace: true });
        }
        console.error("rejecting response ", err);
        return Promise.reject(err);
      }
    );

    return () => {
      console.error("Ejecting intercepts");
      apiClient.interceptors.request.eject(requestInterceptor);
      apiClient.interceptors.response.eject(responseInterceptor);
    };
  }, [apiClient, setIdentity]);

  return <Outlet />;
}
