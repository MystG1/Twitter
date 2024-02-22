import { Outlet, useNavigation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../store/AuthProvider";
import { ClipLoader } from "react-spinners";

export default function Main() {
  // Variable
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-red-600">
        <ClipLoader color="#1DA1F2" />
      </div>
    );
  }

  return <Outlet />;
}
