import { FaTimes } from "react-icons/fa";
import Logo from "../Logo/Logo";
import { useForm } from "react-hook-form";
import { useContext, useState } from "react";
import { AuthContext } from "../../store/AuthProvider";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

export default function RegisterModal({ onClose }) {
  // Variables

  // Const
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const { loginUser } = useContext(AuthContext);
  const Navigate = useNavigate();

  // State

  const [loading, setLoading] = useState(false);

  // Functions
  const onSubmit = (data) => {
    if (loading) return;

    const { email, password } = data;

    loginUser(email, password)
      .then((userCredential) => {
        setLoading(false);
        Navigate("/home");
      })
      .catch((error) => {
        setLoading(false);
        const { code } = error;
        if (code === "auth/user-not-found") {
          toast.error("Cet email n'est pas utilisé");
        } else {
          toast.error(code);
        }
        if (code === "auth/invalid-credential") {
          toast.error("Identifiants de connexions invalides");
        } else {
          toast.error(code);
        }
      });
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-slate-600 bg-opacity-50">
      <motion.div
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
        }}
        transition={{
          duration: 0.2,
        }}
        initial={{
          opacity: 0,
          y: 50,
          scale: 0.8,
        }}
        className="w-full max-w-xl bg-black p-8 rounded-lg relative flex flex-col items-center"
      >
        {/* Close modal */}
        <button
          onClick={onClose}
          className="absolute top-2 left-2 text-slate-100 hover:text-gray-300"
        >
          <FaTimes size={18} />
        </button>

        {/* Logo */}
        <div className="mb-8">
          <Logo />
        </div>

        <h1 className="text-slate-100 text-3xl font-bold">
          Connectez-vous à Twitter
        </h1>

        {/* Connexion Form */}
        <form
          className="mt-8 flex flex-col items-center"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="mb-4">
            {/* Email */}

            <div className="mb-4">
              <p className="text-gray-500 py-2">
                Veuillez saisir vos identifiants de connexion
              </p>
              <input
                type="email"
                placeholder="email"
                {...register("email", {
                  required: true,
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                    message: "Renseignez une adresse valide.",
                  },
                })}
                className="w-full py-4 px-2 border border-gray-600 rounded bg-black text-white"
              />
              {errors.email && (
                <p className="text-red-400 mb-2 mt-2 ">
                  {errors.email.message}
                </p>
              )}

              {/* Password */}
            </div>
            <div className="mb-4">
              <input
                type="password"
                placeholder="Mot de passe"
                // useForm
                {...register("password", {
                  required: true,
                  minLength: {
                    value: 5,
                    message:
                      "Le mot de passe ne peut pas contenir moins de 5 caractères",
                  },
                })}
                className="w-full py-4 px-2 border border-gray-600 rounded bg-black text-white"
              />
              {errors.password && (
                <p className="text-red-400 mb-2 mt-2 ">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="bg-sky-500 hover:bg-gray-50 rounded-full text-black py-2 px-20 text-lg font-semibold shadow-lg hover:shadow-xl transition duration-150 disabled:opacity-80 disabled:cursor-wait"
          >
            Se connecter
          </button>
        </form>
      </motion.div>
    </div>
  );
}
