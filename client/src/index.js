import React, { StrictMode, useState } from "react";
import ReactDOM from "react-dom";
import Root from "./routes/root";
import ErrorPage from "./routes/error-page";
import { LoginPage, SignupPage } from "./routes/account";
import { ProfilePage, EditProfilePage } from "./routes/profile";
import Home from "./routes/home";
import "./index.css";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { createApiClient } from "./bridge/bridge";
import {
  AuthLayout,
  AuthContext,
  updateProfile,
  login,
  isLogged,
  logout,
  signup,
  getIdentity,
} from "./bridge/AuthProvider";
import CategoriesListingPage, {
  CategoryPage,
  ExercisePage,
} from "./routes/practice";
import ChatRoomPage from "./routes/chat";
import { CategoryIndexLoader, CategoryLoader } from "./routes/category";
import CategoryCreationForm, {
  action as CategoryCreationAction,
} from "./routes/categoryCreation";
import ExerciseCreationForm, {
  action as ExerciseCreationAction,
} from "./routes/exerciseCreation";

const apiClient = createApiClient();


const router = ({ identity, setIdentity }) =>
  createBrowserRouter([
    {
      element: (
        <AuthContext.Provider value={{identity, isLogged}}>
          <AuthLayout
            apiClient={apiClient}
            setIdentity={setIdentity}
          />
        </AuthContext.Provider>
      ),
      children: [
        {
          path: "/",
          element: <Root />,
          errorElement: <ErrorPage />,
          id: "root",
          children: [
            {
              errorElement: <ErrorPage />,
              children: [
                {
                  index: true,
                  element: <Home />,
                },
                {
                  path: "account/login",
                  action: login({ setIdentity, apiClient }),
                  element: <LoginPage />,
                },
                {
                  path: "account/signup",
                  action: signup({ setIdentity, apiClient }),
                  element: <SignupPage />,
                },
                {
                  path: "account/logout",
                  action: logout({setIdentity, apiClient}),
                },
                {
                  path: "profile/",
                  id: "profile",
                  loader: getIdentity({ apiClient }),
                  element: <ProfilePage />,
                  children: [
                    {
                      path: "edit/",
                      action: updateProfile({ apiClient }),
                      element: <EditProfilePage />,
                    },
                  ],
                },
                {
                  path: "practice/",
                  element: <CategoriesListingPage />,
                  errorElement: <ErrorPage />,
                  children: [
                    {
                      index: true,
                      id: "categoryIndex",
                      loader: CategoryIndexLoader({ apiClient }),
                      element: <CategoryPage />,
                    },
                    {
                      path: "@new",
                      action: CategoryCreationAction({ apiClient }),
                      element: <CategoryCreationForm />,
                    },

                    {
                      path: ":uri",
                      children: [
                        {
                          index: true,
                          id: "category",
                          loader: CategoryLoader({ apiClient }),
                          element: <CategoryPage />,
                        },
                        {
                          path: "@new",
                          action: ExerciseCreationAction({ apiClient }),
                          element: <ExerciseCreationForm />,
                        },
                        {
                          path: ":id",
                          id: "exercise",
                          element: <ExercisePage />,
                        },
                      ],
                    },
                  ],
                },
                {
                  path: "chat/",
                  element: <ChatRoomPage />,
                },
              ],
            },
          ],
        },
      ],
    },
  ]);

function RenderRoot() {
  const [identity, setIdentity] = useState({});
  return <RouterProvider router={router({ identity, setIdentity })} />;
}

ReactDOM.render(
  <StrictMode>
    <RenderRoot />
  </StrictMode>,
  document.getElementById("root")
);
