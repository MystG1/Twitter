import { FaTimes } from "react-icons/fa";
import Logo from "../Logo/Logo";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { auth } from "../../../firebase";
import { toast } from "react-toastify";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../store/AuthProvider";
import { updateProfile, signOut } from "firebase/auth";
import { motion } from "framer-motion";
import { getStorage, ref, getMetadata, getDownloadURL } from "firebase/storage";
import {
  collection,
  addDoc,
  getFirestore,
  doc,
  setDoc,
} from "firebase/firestore";

// Define the functional component RegisterModal
export default function RegisterModal({ onClose }) {
  // Variables
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const storage = getStorage();
  const defaultUserRef = ref(storage, "images/avatar/defaultUser.png");

  // Function to handle user logout
  const handleLogout = () => {
    logOut();
    navigate("/");
  };

  // State
  const [loading, setLoading] = useState(false);
  const logOut = () => {
    return signOut(auth);
  };

  // Form handling using react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Navigate
  const Navigate = useNavigate();

  // Context
  const { createUser } = useContext(AuthContext);

  // Functions

  const onSubmit = async (data) => {
    if (loading) return;

    setLoading(true);

    try {
      // Create a new user account
      const userCredential = await createUser(
        data.email,
        data.password,
        data.username,
        data.name,
        data.age
      );
      const user = userCredential.user;

      // Update the user profile with default avatar
      await updateProfile(user, {
        displayName: data.username,
        photoURL:
          "https://media.discordapp.net/attachments/1074819110539640972/1210123368225964088/defaultUser.png?ex=65e96a35&is=65d6f535&hm=3cf209d54a6bf8f40caf3ffe332dc8965e5e7ccd1668fd14af1155cab974e370&=&format=webp&quality=lossless",
      });

      // Handle changes in the user authentication state
      const handleAuthStateChanged = async (updatedUser) => {
        if (updatedUser) {
          if (updatedUser.displayName && updatedUser.photoURL) {
            // Update user information in Firestore
            await handleUserSubmit(updatedUser, data.name, data.age);
            // Logout the user, update loading state, close modal, and show success toast
            handleLogout();
            setLoading(false);
            unsubscribe();
            onClose();
            toast.success("Compte créé. Connectez-vous !");
          } else {
            toast.error("Veuillez patienter pendant la mise à jour du profil.");
          }
        }
      };

      // Subscribe to changes in user authentication state
      const unsubscribe = auth.onAuthStateChanged(handleAuthStateChanged);
    } catch (error) {
      setLoading(false);
      const { code, message } = error;
      if (code === "auth/email-already-in-use") {
        toast.error("Cet email est déjà utilisé");
      } else {
        toast.error(message || "Une erreur s'est produite");
      }
    }
  };

  // Function to handle user information submission to Firestore
  const handleUserSubmit = async (updatedUser, name, age) => {
    try {
      const userCollectionRef = collection(getFirestore(), "users");

      const userDocRef = doc(userCollectionRef, updatedUser.uid);

      await setDoc(userDocRef, {
        userId: updatedUser.uid,
        userDisplayName: updatedUser.displayName,
        userImg: updatedUser.photoURL,
        userEmail: updatedUser.email,
        userNickName: name,
        userAge: age,
        timestamp: new Date(),
      });
    } catch (error) {
      toast.error("Une erreur est survenue :", error.message);
    }
  };

  // Render the RegisterModal component
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
          Créer votre compte
        </h1>

        {/* Register Form */}
        <form
          className="mt-8 flex flex-col items-center"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="mb-4">
            {/* Email */}

            <div className="mb-4">
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
                    value: 6,
                    message:
                      "Le mot de passe ne peut pas contenir moins de 6 caractères",
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
            {/* Name */}
            <div className="mb-4 mt-10">
              <input
                placeholder="Nom et prénom"
                // useForm
                {...register("name", {
                  required: true,
                })}
                className="w-full py-4 px-2 border border-gray-600 rounded bg-black text-white"
              />
            </div>
            {/* username */}
            <div className="mb-4">
              <input
                placeholder="pseudo"
                // useForm
                {...register("username", {
                  required: true,
                  maxLength: {
                    value: 10,
                    message:
                      "Le pseudo ne peut pas contenir plus de 10 caractères",
                  },
                })}
                className="w-full py-4 px-2 border border-gray-600 rounded bg-black text-white"
              />
              {errors.username && (
                <p className="text-red-400 mb-2 mt-2 ">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Age */}
            <p className="text-gray-500 py-2">
              Cette information ne sera pas affichée publiquement. Confirmez{" "}
              <br />
              votre âge, même si ce compte est pour une entreprise, un animal de{" "}
              <br />
              compagnie ou autre chose.
            </p>

            <input
              type="number"
              placeholder="âge"
              {...register("age", {
                required: true,
                min: {
                  value: 18,
                  message: "Vous devez être majeur pour vous inscrire",
                },
                max: {
                  value: 100,
                  message: "Renseignez un âge valide",
                },
              })}
              className="w-full py-4 px-2 border border-gray-600 rounded bg-black text-white"
            />
            {errors.age && (
              <p className="text-red-400 mb-2 mt-2 ">{errors.age.message}</p>
            )}
          </div>

          {/* Submit */}
          <button
            disabled={loading}
            type="submit"
            className="bg-sky-500 hover:bg-gray-50 rounded-full text-black py-2 px-20 text-lg font-semibold  shadow-lg hover:shadow-xl transition duration-150 disabled:opacity-80 disabled:cursor-wait"
          >
            S'inscrire
          </button>
        </form>
      </motion.div>
    </div>
  );
}
