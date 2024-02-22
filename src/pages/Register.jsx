import { useState } from "react";
import { motion } from "framer-motion";
import RegisterModal from "../components/Register/RegisterModal";
import LogInModal from "../components/LogIn/LogInModal";

export default function Register() {
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showLogInModal, setShowLogInModal] = useState(false);

  const handleOpenRegisterModal = () => {
    setShowRegisterModal(true);
  };

  const handleCloseRegisterModal = () => {
    setShowRegisterModal(false);
  };

  const handleOpenLogInModal = () => {
    setShowLogInModal(true);
  };

  const handleCloseLogInModal = () => {
    setShowLogInModal(false);
  };

  const handleRegisterSuccess = () => {
    setShowRegisterModal(false);
    setShowLogInModal(true);
  };

  return (
    <div className="flex justify-around items-center h-screen w-screen mx-auto">
      <motion.img
        src="/logo.png"
        alt="logo"
        className="mx-10 "
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        transition={{
          duration: 1,
        }}
        initial={{
          opacity: 0,
          y: -30,
          scale: 0.5,
        }}
      />
      <div className="text-left text-slate-100">
        <p className="font-bold text-7xl ">
          ça se passe <br /> maintenant
        </p>
        <p className="text-4xl py-14 font-bold">Inscrivez-vous.</p>

        <div className=" object-fill">
          <button
            onClick={handleOpenRegisterModal}
            className="bg-sky-500 hover:bg-gray-50 rounded-full text-black py-2 px-20 text-lg font-semibold shadow-lg hover:shadow-xl transition duration-150 disabled:opacity-80 disabled:cursor-wait"
          >
            Créer un compte
          </button>
          <p className=" text-xs py-2 text-gray-400">
            En vous inscrivant, vous acceptez les Conditions <br />
            d'utilisation et la Politique de confidentialité, notamment <br />
            l'Utilisation des cookies.
          </p>

          <div className="py-10">
            <p className="py-3 text-xl font-bold ">
              Vous avez déjà un compte ?{" "}
            </p>
            <button
              onClick={handleOpenLogInModal}
              className="bg-black text-blue-400 border border-gray-500 hover:bg-gray-50 rounded-full hover:text-black py-2 px-24 text-lg font-semibold shadow-lg hover:shadow-xl transition duration-150 disabled:opacity-80 disabled:cursor-wait"
            >
              Se connecter
            </button>
          </div>
        </div>
      </div>

      {showRegisterModal && (
        <RegisterModal
          onClose={handleCloseRegisterModal}
          onRegisterSuccess={handleRegisterSuccess}
        />
      )}
      {showLogInModal && <LogInModal onClose={handleCloseLogInModal} />}
    </div>
  );
}
