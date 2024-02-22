import { motion } from "framer-motion";
import TextareaAutosize from "react-textarea-autosize";
import { useContext } from "react";
import { AuthContext } from "../../store/AuthProvider";
import { useState, useEffect } from "react";
import {
  addDoc,
  collection,
  getFirestore,
  getDocs,
  getDoc,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { query, where } from "firebase/firestore";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";
import TrashIcon from "../Icons/TrashIcon";
import CrossIcon from "../Icons/crossIcon";

// Define the functional component Comments

export default function Comments({ selectedTweet, onClose }) {
  // Retrieve user information from AuthContext
  const { user } = useContext(AuthContext);

  // State variables to manage comment content, comments list, and loading state
  const [commentContent, setCommentContent] = useState("");
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Extract commentNumber from selectedTweet
  let commentNumber = selectedTweet.commentNumber;

  // useEffect hook to load comments when selectedTweet.id changes
  useEffect(() => {
    loadComments();
  }, [selectedTweet.id]);

  // Function to handle container click and close the Comments modal
  const handleContainerClick = (e) => {
    if (e.target.classList.contains("closeContainer")) {
      onClose();
    }
  };

  // Function to handle comment submission
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Add a new comment to the "comments" collection in Firestore
      await addDoc(collection(getFirestore(), "comments"), {
        userId: user.uid,
        userDisplayName: user.displayName,
        userImg: user.photoURL,
        userEmail: user.email,
        content: commentContent,
        tweetId: selectedTweet.id,

        timestamp: new Date(),
      });

      // Update the comment count in the corresponding tweet document
      const tweetDocRef = doc(getFirestore(), "tweets", selectedTweet.id);
      const existingTweet = await getDoc(tweetDocRef);

      if (existingTweet.exists()) {
        const currentCommentCount = existingTweet.data().comment || 0;

        await updateDoc(tweetDocRef, {
          comment: currentCommentCount + 1,
        });
      }

      // Reset comment content, show success toast, and update loading state
      setCommentContent("");
      toast.success("Commentaire envoyé");
      setLoading(false);
    } catch (error) {
      console.log(error);
      toast.error("Une erreur est survenue :", error.message);
    }
  };

  // Function to load comments for the selectedTweet
  const loadComments = async () => {
    setLoading(true);
    const db = getFirestore();

    // Query the "comments" collection in Firestore for comments related to the selectedTweet
    const commentsQuery = collection(db, "comments");
    const snapshot = await getDocs(
      query(commentsQuery, where("tweetId", "==", selectedTweet.id))
    );

    // Extract and set the comments data from the snapshot
    const commentsData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setComments(commentsData);
    loadComments();
    setLoading(false);
  };

  // Function to delete a comment
  const deleteComment = async (commentId) => {
    try {
      // Delete the comment document from the "comments" collection in Firestore
      const db = getFirestore();
      const commentRef = doc(db, "comments", commentId);
      await deleteDoc(commentRef);
      toast.success("Commentaire supprimé avec succès");
      loadComments();
      const tweetDocRef = doc(getFirestore(), "tweets", selectedTweet.id);

      const existingTweet = await getDoc(tweetDocRef);

      if (existingTweet.exists()) {
        const currentCommentCount = existingTweet.data().comment || 0;

        await updateDoc(tweetDocRef, {
          comment: currentCommentCount - 1,
        });
      }
    } catch (error) {
      console.error(
        "Erreur lors de la suppression du commentaire :",
        error.message
      );
      console.log(error);
      toast.error(
        "Une erreur est survenue lors de la suppression du commentaire"
      );
    }
  };

  // Function to format timestamp to a readable date
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleString();
  };

  // Sort comments by timestamp in descending order
  const sortedComments = comments
    .slice()
    .sort((a, b) => b.timestamp.seconds - a.timestamp.seconds);
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full text-red-600">
        <ClipLoader color="#1DA1F2" />
      </div>
    );
  }

  // Render the Comments modal
  return (
    <div
      onClick={handleContainerClick}
      className="closeContainer fixed top-0 left-0 w-full h-full flex  justify-center bg-slate-600 bg-opacity-40 "
    >
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
        className="w-full overflow-auto scrollbar-thin scrollbar-track-twitterDark scrollbar-thumb-slate-700 scrollbar-track-current max-w-xl bg-black p-8 rounded-lg relative  items-center"
      >
        <div className="bg-black text-slate-200 w-full  resize-none h-auto">
          <div className="flex justify-between ">
            <div className="flex items-center ">
              <img
                src={selectedTweet.userImg}
                alt="profilImage"
                className="w-10 h-10 mx-2 rounded-full"
              />
              <b>
                <p className="text-slate-200 text-base  ">
                  {selectedTweet.userDisplayName}
                </p>
              </b>
              <div className="text-slate-600 text-sm flex items-center">
                {selectedTweet.displayName}
                <p className=" text-lg ml-2">@</p>
                {selectedTweet.userId.slice(-5)}
              </div>
              <p className="text-gray-500 px-2">
                {formatTimestamp(selectedTweet.timestamp)}
              </p>
            </div>
            <p
              onClick={onClose}
              className="text-gray-500 px-2 lg:hidden ml-60 absolute left-72"
            >
              <CrossIcon />
            </p>
          </div>
          <p
            className="tweet-content ml-14 text-slate-200  "
            style={{ whiteSpace: "pre-wrap" }}
          >
            {selectedTweet.content}
          </p>
          <img
            className={` ${
              selectedTweet.image === "" ? "" : "border border-gray-500"
            }`}
            src={selectedTweet.image}
            alt=""
          />

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
          >
            <form
              className="w-full max-w-xl bg-black p-8  relative flex items-center border-t border-b mt-10 border-gray-500 py-3"
              onSubmit={handleCommentSubmit}
            >
              <TextareaAutosize
                className="bg-black text-slate-200 w-full text-2xl resize-none  h-auto overflow-hidden "
                placeholder="Envoyer un commentaire..."
                style={{ whiteSpace: "pre-line" }}
                required
                onChange={(e) => setCommentContent(e.target.value)}
                value={commentContent}
              />

              <button
                className="bg-sky-500 hover:bg-gray-50 rounded-full text-black ml-5 px-2 py-1 text-lg font-semibold shadow-lg hover:shadow-xl transition duration-150 disabled:opacity-80 disabled:cursor-wait
             "
                type="submit"
              >
                Envoyer
              </button>
            </form>
          </motion.div>
          {sortedComments.map((comment) => (
            <motion.div
              key={comment.id}
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
              className="border-t mb-10 mt-8 pt-3"
            >
              <div className="flex justify-between ">
                <div className="flex items-center ">
                  <img
                    src={comment.userImg}
                    alt="profilImage"
                    className="w-10 h-10 mx-2 rounded-full"
                  />
                  <b>
                    <p className="text-slate-200 text-base  ">
                      {comment.userDisplayName}
                    </p>
                  </b>
                  <div className="text-slate-600 text-sm flex items-center">
                    {comment.displayName}
                    <p className=" text-lg ml-2">@</p>
                    {comment.userId.slice(-5)}
                  </div>
                </div>
                <p className="text-gray-500 px-2">
                  {formatTimestamp(comment.timestamp)}
                </p>
                {user.uid === comment.userId && (
                  <p
                    onClick={() => deleteComment(comment.id)}
                    className="text-white px-2 text-sm font-semibold cursor-pointer hover:text-red-500 duration-150"
                  >
                    <TrashIcon />
                  </p>
                )}
              </div>

              <p
                className="tweet-content ml-14 text-slate-200  "
                style={{ whiteSpace: "pre-wrap" }}
              >
                {comment.content}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
