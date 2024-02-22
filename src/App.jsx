import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Error from "./pages/Error";
import { lazy, Suspense } from "react";
import Main from "./layouts/Main";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useEffect, useContext } from "react";

const Home = lazy(() => import("./pages/Home"));
const Register = lazy(() => import("./pages/Register"));
const Profil = lazy(() => import("./pages/Profil"));
import { AuthContext } from "./store/AuthProvider";

export default function App() {
  const { user, loading } = useContext(AuthContext);

  return (
    <>
      <ToastContainer theme="dark" position="bottom-right" />
      <RouterProvider
        router={createBrowserRouter([
          {
            path: "/",
            element: <Main />,
            errorElement: <Error />,
            children: [
              {
                index: true,
                element: <Suspense>{user ? <Home /> : <Register />}</Suspense>,
              },
              {
                path: "/Home",
                element: (
                  <Suspense>
                    <Home />
                  </Suspense>
                ),
              },
              {
                path: "/Profil",
                element: (
                  <Suspense>
                    <Profil />
                  </Suspense>
                ),
              },
            ],
          },
        ])}
      />
    </>
  );
}
