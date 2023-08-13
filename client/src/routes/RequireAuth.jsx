import React from "react";
import useAuth from "../bridge/AuthProvider";

import { Navigate } from "react-router-dom";

export default function RequireAuth({ children, redirectTo }) {
  const auth = useAuth();
  console.debug("auth is", auth);
  return auth.checkAuth () ? (
    { children }
  ) : (
    <Navigate
      to={redirectTo}
      replace={true}
    />
  );
}
