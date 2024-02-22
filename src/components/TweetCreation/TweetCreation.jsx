import { useContext, useState } from "react";
import { AuthContext } from "../../store/AuthProvider";
import { collection, addDoc, getFirestore } from "firebase/firestore";
import { toast } from "react-toastify";
import { getDoc } from "firebase/firestore";
import TextareaAutosize from "react-textarea-autosize";
import { useNavigate } from "react-router-dom";
import "./tweetCreation.css";
import React from "react";
import { motion } from "framer-motion";
import ImageIcon from "../Icons/imageIcon";
import CrossIcon from "../Icons/crossIcon";

// Define the functional component TweetCreation
export default function TweetCreation() {
  const { user } = useContext(AuthContext);

  // State to manage tweet content, image, and image upload visibility
  const [tweetContent, setTweetContent] = useState("");
  const [tweetImage, setTweetImage] = useState("");
  const [imageUpload, setImageUpload] = useState(false);
  const navigate = useNavigate();

  // Function to handle tweet submission
  const handleTweetSubmit = async (e) => {
    e.preventDefault();

    try {
      // Add a new tweet to the "tweets" collection in Firestore
      await addDoc(collection(getFirestore(), "tweets"), {
        userId: user.uid,
        userDisplayName: user.displayName,
        userImg: user.photoURL,
        userEmail: user.email,
        content: tweetContent,
        image: tweetImage,
        like: 0,
        comment: 0,
        timestamp: new Date(),
      });

      // Reset tweet content and image state
      setTweetContent("");
      setTweetImage("");
    } catch (error) {
      toast.error("Une erreur est survenue :", error.message);
    }
  };

  // Function to open and close the image uploader
  const openImageUploader = (e) => {
    e.stopPropagation();
    setImageUpload(true);
  };
  const closeImageUploader = (e) => {
    e.stopPropagation();

    setImageUpload(false);
  };

  // Render the TweetCreation component
  return (
    <div className="flex border-b border-gray-500 py-2">
      {user ? (
        <div>
          <img
            src={user.photoURL}
            alt="profil"
            className="w-10 h-10 mx-2 mt-12 border-2 rounded-3xl "
          />{" "}
          <p className="text-slate-200 text-center font-semibold ml-[5px]">
            {user.displayName}
          </p>
        </div>
      ) : null}

      <form className="w-full" onSubmit={handleTweetSubmit}>
        <TextareaAutosize
          className="customTextarea bg-black text-slate-200 w-full text-2xl resize-none h-auto overflow-hidden"
          placeholder="Quoi de neuf ?"
          value={tweetContent}
          onChange={(e) => setTweetContent(e.target.value)}
          required
        />

        {imageUpload && (
          <motion.textarea
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
            className="customTextarea border border-dashed border-gray-500  text-gray-500 mt-3 w-full  resize-none"
            placeholder="Collez le lien d'une image... "
            value={tweetImage}
            onChange={(e) => setTweetImage(e.target.value)}
          />
        )}
        {imageUpload === false && (
          <p
            onClick={openImageUploader}
            className="border-t border-b p-2 border-gray-500 text-sky-500 mt-3 text-sm font-semibold hover:text-green-500 hover:cursor-pointer duration-300"
          >
            <ImageIcon />
          </p>
        )}

        {imageUpload && (
          <p
            onClick={closeImageUploader}
            className="border-t border-b p-2 border-gray-500 text-slate-200 mt-3 text-sm font-semibold hover:text-red-500 hover:cursor-pointer duration-300"
          >
            <CrossIcon />
          </p>
        )}
        <button
          type="submit"
          className="w-auto h-8 px-5 mt-12 mr-2 ml-2 bg-sky-500 hover:bg-gray-50 rounded-full text-black text-lg font-semibold shadow-lg hover:shadow-xl transition duration-150 disabled:opacity-80 disabled:cursor-wait"
        >
          Post
        </button>
      </form>
    </div>
  );
}
