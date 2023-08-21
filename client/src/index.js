import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Root from "./routes/root";
import ErrorPage from "./routes/error-page";
import SignupPage from "./routes/signup";
import LoginPage from "./routes/login";
import { ProfilePage, EditProfilePage } from "./routes/profile";
import Home from "./routes/home";
import "./index.css";
import cookie from "react-cookies";

import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
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
  ExerciseUpdatePage,
  categoryCreationAction,
  categoryDeletionAction,
  exerciseCreationAction,
  exerciseDeletionAction,
  questionCreationAction,
  questionDeletionAction,
} from "./routes/practice/practice";
import ChatRoomPage from "./routes/chat";
import { rootCategoryLoader, categoryLoader } from "./routes/practice/category";
import { exerciseLoader, ExerciseProvider } from "./routes/practice/exercise";
import QuestionUpdater from "./routes/practice/questions";

const router = ({ identity, resetIdentityCookie }) =>
  createBrowserRouter([
    {
      path: "/",
      element: (
        <NavigateFunctional resetIdentityCookie={resetIdentityCookie}>
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
              action: login({ resetIdentityCookie }),
              element: <LoginPage />,
            },
            {
              path: "account/signup",
              action: signup,
              element: <SignupPage />,
            },
            {
              path: "account/logout",
              action: logout({ resetIdentityCookie }),
              element: (
                <Navigate
                  to='/'
                  replace={true}
                />
              ),
            },
            {
              path: "profile/",
              id: "profile",
              loader: getIdentity({ resetIdentityCookie }),
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
              path: "practice",
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
                  path: ":uri",
                  id: "category",
                  children: [
                    {
                      index: true,
                      loader: categoryLoader,
                      element: <CategoryPage />,
                    },
                    {
                      path: "@new",
                      action: exerciseCreationAction,
                      element: <ExerciseCreationPage />,
                    },
                    {
                      path: "@delete",
                      action: categoryDeletionAction,
                    },
                    {
                      path: ":uriName",
                      loader: exerciseLoader,
                      element: <ExerciseProvider />,
                      id: "exercise",
                      children: [
                        {
                          index: true,
                          loader: exerciseLoader,
                          element: <ExercisePage />,
                        },
                        {
                          path: "@new",
                          action: questionCreationAction,
                        },
                        {
                          path: "@update",
                          element: <ExerciseUpdatePage readOnly={true} />,
                          children: [
                            {
                              path: "questions",
                              element: <QuestionUpdater />,
                            },
                          ],
                        },
                        {
                          path: "@delete",
                          action: exerciseDeletionAction,
                        },
                        {
                          path: ":qid",
                          children: [
                            {
                              path: "@delete",
                              action: questionDeletionAction,
                            },
                          ],
                        },
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
    options ??= {};
    options.path ??= "/";
    options.sameSite ??= "strict";
    options.maxAge ??= 1800;
    if (value != null) {
      cookie.save("identity", value, options);
      loggedUser({ identity, setIdentity });
    } else {
      cookie.remove("identity", options);
      loggedUser({ identity, setIdentity });
    }
  };
  React.useLayoutEffect(() => {
    loggedUser({ identity, setIdentity });
    return () => {};
  }, []);

  return <RouterProvider router={router({ identity, resetIdentityCookie })} />;
}

const domNode = document.getElementById("root");
const root = createRoot(domNode);
root.render(
  <StrictMode>
    <RenderRoot />
  </StrictMode>
);
