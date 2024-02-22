import { NavLink, useNavigate } from "react-router-dom";
import Logo from "../Logo/Logo";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../store/AuthProvider";
import { motion } from "framer-motion";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";

import TweetCreation from "../TweetCreation/TweetCreation";
import HomeIcon from "../Icons/HomeIcon";
import ProfilIcon from "../Icons/ProfilIcon";
import SendIcon from "../Icons/SendIcon";
import DisconnectIcon from "../Icons/DisconnectIcon";
export default function Nav() {
  // State
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTweetCreationModalOpen, setIsTweetCreationModalOpen] =
    useState(false);

  // Context
  const { user } = useContext(AuthContext);
  const { logOut } = useContext(AuthContext);
  const navigate = useNavigate();

  // Effect
  useEffect(() => {
    document.addEventListener("click", handleOutsideClick);

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [isModalOpen]);

  useEffect(() => {
    document.addEventListener("click", handleOutsideClickTweetCreation);

    return () => {
      document.removeEventListener("click", handleOutsideClickTweetCreation);
    };
  }, [isTweetCreationModalOpen]);

  useEffect(() => {
    if (user && user.displayName && user.photoURL) {
      setLoading(false);
    }
  }, [user]);

  // Functions
  const handleOutsideClick = (e) => {
    if (isModalOpen && e.target.closest(".modalContainer") === null) {
      if (isModalOpen) {
        closeModal();
      }
    }
  };

  const handleOutsideClickTweetCreation = (e) => {
    if (
      isTweetCreationModalOpen &&
      e.target.closest(".tweetCreationModalContainer") === null
    ) {
      if (isTweetCreationModalOpen) {
        closeTweetCreationModal();
      }
    }
  };
  // Open logOut modal
  const openModal = (e) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  // Close logOut modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Open TweetCreation modal
  const openTweetCreationModal = (e) => {
    e.stopPropagation();
    setIsTweetCreationModalOpen(true);
  };

  // Close TweetCreation modal
  const closeTweetCreationModal = () => {
    setIsTweetCreationModalOpen(false);
  };

  // Logout and redirection
  const handleLogout = () => {
    logOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-red-600">
        <ClipLoader color="#1DA1F2" />
      </div>
    );
  }

  if (!user || !user.displayName || !user.photoURL) {
    return null;
  }

  return (
    <nav className="lg:ml-[15%] lg:w-auto w-13  mt-5 position-sticky  ">
      <div className="font-semibold">
        {/* Links */}
        <div className="flex flex-col text-xl gap-y-5  text-left">
          <Logo />
          <NavLink
            to="/home"
            className={({ isActive }) =>
              `lg:block hidden px-10 py-3 font-semibold hover:bg-twitterDark hover:rounded-full duration-150 ${
                isActive ? "text-sky-400" : "text-slate-100"
              }`
            }
          >
            Accueil
          </NavLink>
          {/* FOR SMALL SCREEN */}
          <NavLink
            to="/home"
            className={({ isActive }) =>
              `lg:hidden mb-[-50px] px-10 py-3 font-semibold hover:bg-twitterDark hover:rounded-full duration-150 ${
                isActive ? "text-sky-400" : "text-slate-100"
              }`
            }
          >
            <HomeIcon />
          </NavLink>
          <NavLink
            to="/profil"
            className={({ isActive }) =>
              `lg:block hidden px-10 py-3 font-semibold  hover:bg-twitterDark hover:rounded-full duration-150 ${
                isActive ? "text-sky-400" : "text-slate-100"
              }`
            }
          >
            Profil
          </NavLink>
          {/* FOR SMALL SCREEN */}*
          <NavLink
            to="/profil"
            className={({ isActive }) =>
              `lg:hidden px-10 py-3 font-semibold  hover:bg-twitterDark hover:rounded-full duration-150 ${
                isActive ? "text-sky-400" : "text-slate-100"
              }`
            }
          >
            <ProfilIcon />
          </NavLink>
          <button
            onClick={openTweetCreationModal}
            className="lg:block hidden bg-sky-500  hover:bg-gray-50 rounded-full text-black my-10 py-2 px-20 text-lg font-semibold shadow-lg hover:shadow-xl transition duration-150 disabled:opacity-80 disabled:cursor-wait"
          >
            Post
          </button>
          {/* FOR SMALL SCREEN */}
          <button
            onClick={openTweetCreationModal}
            className="lg:hidden px-10 py-3 font-semibold text-sky-400 hover:bg-twitterDark hover:rounded-full duration-150 "
          >
            <SendIcon />
          </button>
          {/* Modal*/}
          {isModalOpen && (
            <motion.div
              animate={{
                opacity: 1,
                scale: 1,
              }}
              transition={{
                duration: 0.2,
              }}
              initial={{
                opacity: 0,
                scale: 0.9,
              }}
              className="absolute lg:mt-[355px] lg:ml-[-40px] mt-[340px] ml-[12px]"
            >
              <div className="modalContainer">
                {user && (
                  <div className="bg-black py-2 rounded-md shadow-lg border border-gray-600 hover:bg-slate-600  hover:cursor-pointer duration-150 ">
                    <p
                      onClick={() => handleLogout()}
                      disabled={loading}
                      className=" lg:block hidden m-0 text-white  px-5 text-sm font-semibold"
                    >
                      Déconnecter {user.email}
                    </p>
                    <p
                      onClick={() => handleLogout()}
                      disabled={loading}
                      className="  m-0 text-white  px-5 text-sm font-semibold"
                    >
                      <DisconnectIcon />
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
          {/* TweetCreationModal */}
          {isTweetCreationModalOpen && (
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute top-[470px] left-16 w-1/4"
            >
              <div className="tweetCreationModalContainer">
                <div className=" bg-black py-2 mt-[-70px] rounded-md shadow-lg border border-gray-600 ">
                  <TweetCreation closeModal={closeTweetCreationModal} />
                </div>
              </div>
            </motion.div>
          )}
          <div
            onClick={openModal}
            className=" items-center flex hover:cursor-pointer duration-150 py-2 px-5"
          >
            {" "}
            <img
              src={user.photoURL}
              alt="profil"
              className=" top-80 mt-3 ml-1 h-10 mx-2 border-2 rounded-3xl object-fit-cover   "
            />
            <div>
              <p className="text-slate-200 text-base lg:block hidden ">
                {user.displayName}
              </p>

              <div className="text-slate-600 lg:flex hidden  text-sm items-center">
                {user.displayName}
                <p className=" text-lg ml-2">@</p>
                {user.uid.slice(-5)}
              </div>
            </div>
            <p className="text-slate-300 mb-3 mx-2 lg:block hidden">...</p>
          </div>
        </div>
      </div>
    </nav>
  );
}
