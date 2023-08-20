import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Root from "./routes/root";
import ErrorPage from "./routes/error-page";
import { LoginPage, SignupPage } from "./routes/account";
import { ProfilePage, EditProfilePage } from "./routes/profile";
import Home from "./routes/home";
import "./index.css";
import cookie from "react-cookies";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import {
  updateProfile,
  login,
  logout,
  signup,
  getIdentity,
  loggedUser,
  NavigateFunctional,
  IdentityProvider,
} from "./bridge/authUtilities";
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

const router = ({ identity, resetIdentityCookie }) =>
  createBrowserRouter([
    {
      path: "/",
      element: (
        <NavigateFunctional>
          <IdentityProvider identity={identity}>
            <Root />
          </IdentityProvider>
        </NavigateFunctional>
      ),
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
              action: login({resetIdentityCookie}),
              element: <LoginPage />,
            },
            {
              path: "account/signup",
              action: signup,
              element: <SignupPage />,
            },
            {
              path: "account/logout",
              action: logout({resetIdentityCookie}),
            },
            {
              path: "profile/",
              id: "profile",
              loader: getIdentity({resetIdentityCookie}),
              element: <ProfilePage />,
              children: [
                {
                  path: "edit/",
                  action: updateProfile,
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
                  loader: rootCategoryLoader,
                  element: <CategoryPage />,
                },
                {
                  path: "@new",
                  action: categoryCreationAction,
                  element: <CategoryCreationPage />,
                },
                {
                  path: "@delete",
                  action: categoryDeletionAction,
                },

                {
                  path: ":uri",
                  id: "category",
                  loader: categoryLoader,
                  element: <CategoryPage />,
                  children: [
                    {
                      path: "@new",
                      action: exerciseCreationAction,
                      element: <ExerciseCreationPage />,
                    },
                    {
                      path: "@delete",
                      action: exerciseDeletionAction,
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
  ]);

function RenderRoot() {
  const [identity, setIdentity] = React.useState(false);
  loggedUser({ identity, setIdentity });
  const resetIdentityCookie = (value, options) => {
    if (value != null)
    {
      cookie.save("identity", value, options);
      loggedUser({identity, setIdentity});
    } else {
      cookie.remove("identity", options);
      loggedUser({identity, setIdentity});
    }
  }
  return <RouterProvider router={router({ identity, resetIdentityCookie })} />;
}

const domNode = document.getElementById("root");
const root = createRoot(domNode);
root.render(
  <StrictMode>
    <RenderRoot />
  </StrictMode>
);
