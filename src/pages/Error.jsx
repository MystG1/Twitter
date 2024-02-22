import { Link } from "react-router-dom";
import { AuthContext } from "../store/AuthProvider";
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo/Logo";

export default function Error() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Automatically redirect to "/" when the component mounts
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <div className="flex flex-col gap-5 h-screen justify-center items-center">
      <Logo />

      <p className="text-3xl text-slate-200">
        <span className="text-yellow-pokemon">Oups ! </span>Il semblerait qu'une
        <b> erreur</b> est survenue...
      </p>

      {user ? (
        <Link
          to="/"
          className="bg-sky-500 hover:bg-gray-50 rounded-full text-black py-2 px-20 text-lg font-semibold shadow-lg hover:shadow-xl transition duration-150 disabled:opacity-80 disabled:cursor-wait"
        >
          Retourner à l'accueil
        </Link>
      ) : (
        <>
          <p className="text-red-500">Vous êtes déconnecté(e).</p>

          {navigate("/")}
        </>
      )}
    </div>
  );
}
