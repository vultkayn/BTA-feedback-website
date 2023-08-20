import React, { useEffect } from "react";
import { redirect, useNavigate } from "react-router-dom";
import cookie from "react-cookies";
import setupInterceptors from "./interceptors";
import axios from "./bridge"



export function loggedUser({ identity, setIdentity }) {
  const idty = cookie.load("identity");
  if (idty == null || typeof idty !== "object" || !idty.univID) {
    cookie.remove("identity");
    if (identity != null) setIdentity(null);
    return null;
  }
  cookie.save("identity", idty, { maxAge: 1800 });
  if (
    identity == null ||
    identity.univID !== idty.univID ||
    identity.email !== idty.email ||
    identity.id !== idty.id
  )
    setIdentity(idty);
  return idty;
}

/* Reset identity and Send username and password to the server.
   Action of /account/login form.  */
export const login = ({resetIdentityCookie}) =>
  async ({ request }) => {
    try {
      console.debug("account/login action called");
      const formData = await request.formData();
      const body = Object.fromEntries(formData);
      const res = await axios.post("/api/auth/login", body);
      if (res.data && typeof res.data === "object") {
        let newIdentity = {};
        if ("univID" in res.data) newIdentity.univID = res.data.univID;
        if ("email" in res.data) newIdentity.email = res.data.email;
        if ("id" in res.data) newIdentity.id = res.data.id;

        if (newIdentity?.univID || newIdentity?.email || newIdentity?.id)
        resetIdentityCookie(newIdentity, { maxAge: 1800 });
      }
      return redirect("/");
    } catch (error) {
      console.error("error in login action", error);
      return error.response;
    }
  };

/* Disconnect the user and erase notify the server.
   Action of /account/logout button  */
export const logout =  ({resetIdentityCookie}) => async () => {
    try {
      await axios.get("/api/auth/logout");
      resetIdentityCookie();
      return redirect("/", { replace: true });
    } catch (error) {
      console.error("logout action failed with", error);
      return Promise.reject(error.response);
    }
  };

/* Create a new account and automatically log into it.
   Action of /account/signup form.  */
export const signup =  async ({ request }) => {
    try {
      const formData = await request.formData();
      const userInfos = Object.fromEntries(formData);
      await axios.post("/api/auth", userInfos);
      return redirect("/account/login", { replace: true });
    } catch (error) {
      console.error("account/signup action failed with", error);
      return Promise.reject(error.response);
    }
  };

/* Refresh the current user local identity from the server.  */
export const getIdentity = ({resetIdentityCookie}) =>
  async () => {
    try {
      const response = await axios.get("/api/users");
      console.debug("'getIdentity' response is", response);
      resetIdentityCookie(
        {
          univID: response.data.univID,
          email: response.data.email,
          id: response.data.id,
        },
        { maxAge: 1800 }
      )
      return response.data;
    } catch (error) {
      console.error("getIdentity failed with", error);
      return Promise.reject(error.response);
    }
  };

/* Action of /profile/edit
   Update the current user profile on the server.  */
export const updateProfile =
  async ({ request }) => {
    try {
      const formData = await request.formData();
      const updates = Object.fromEntries(formData);
      await axios.put("/api/users", updates);
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

export function NavigateFunctional({children}) {
  const navigate = useNavigate();
  useEffect(() => {
    setupInterceptors(navigate);
  }, [navigate]);

  return <>{children}</>;
}

export const AuthContext = React.createContext(null);
export default function useAuth() {
  return React.useContext(AuthContext);
}

export function IdentityProvider({identity, children}) {
  
  const loggedIn = identity != null;
  return (
    <AuthContext.Provider value={{ identity, loggedIn }}>
      {children}
    </AuthContext.Provider>
  );
}