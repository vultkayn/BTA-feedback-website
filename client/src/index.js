import React, { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
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
import PracticeRouteScaffold, {
  CategoryPage,
  ExercisePage,
  CategoryCreationPage,
  ExerciseCreationPage,
  categoryCreationAction,
  categoryDeletionAction,
  exerciseCreationAction,
  exerciseDeletionAction,
} from "./routes/practice/practice";
import ChatRoomPage from "./routes/chat";
import { rootCategoryLoader, categoryLoader } from "./routes/practice/category";
import { exerciseLoader } from "./routes/practice/exercise";

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
                  element: <PracticeRouteScaffold />,
                  errorElement: <ErrorPage />,
                  children: [
                    {
                      index: true,
                      id: "categoryIndex",
                      loader: RootCategoryLoader({ apiClient }),
                      element: <CategoryPage />,
                    },
                    {
                      path: "@new",
                      action: CategoryCreationAction({ apiClient }),
                      element: <CategoryCreationPage />,
                    },
                    {
                      path: "@delete",
                      action: categoryDeletionAction,
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
                          path: ":uriName",
                          children: [
                            {
                              index: true,
                              id: "exercise",
                              loader: exerciseLoader,
                              element: <ExercisePage />,
                            },
                            {},
                          ],
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

const domNode = document.getElementById("root");
const root = createRoot(domNode);
root.render(
  <StrictMode>
    <RenderRoot />
  </StrictMode>
);
