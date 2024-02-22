import Nav from "../components/Nav/Nav";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../store/AuthProvider";
import ReturnIcon from "../components/Icons/ReturnIcon";
import { doc, getFirestore, getDoc } from "firebase/firestore";
import { updateDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { auth } from "../../firebase";
import { query } from "firebase/firestore";
import { collection } from "firebase/firestore";
import { where } from "firebase/firestore";
import ClipLoader from "react-spinners/ClipLoader";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import EditIcon from "../components/Icons/EditIcon";
import CrossIcon from "../components/Icons/crossIcon";
import { onSnapshot } from "firebase/firestore";

import { getDocs } from "firebase/firestore";

import TrashIcon from "../components/Icons/TrashIcon";
import CommentIcon from "../components/Icons/CommentIcon";
import HeartIcon from "../components/Icons/heartIcon";
import Comments from "../components/Comments/Comments";
import TextareaAutosize from "react-textarea-autosize";
import { deleteDoc } from "firebase/firestore";

export default function Profil() {
  const [myTweets, setMyTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newDisplayName, setNewDisplayName] = useState("");
  const [imgEditModal, setImgEditModal] = useState(false);
  const [displayNameEditModal, setDisplayNameEditModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // FROM HOME concerning tweet edition ---------------------------------------------------------------

  const [idTweetSelected, setIdTweetSelected] = useState(null);
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });

  const [likedTweets, setLikedTweets] = useState([]);
  const [realTimeLikeCount, setRealTimeLikeCount] = useState({});

  const [editedTweetContent, setEditedTweetContent] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
  const [tweets, setTweets] = useState([]);

  const [selectedTweetId, setSelectedTweetId] = useState(null);

  useEffect(() => {
    document.addEventListener("click", handleOutsideClick);

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [idTweetSelected, isEditModalOpen]);

  const handleOutsideClick = (e) => {
    if (e) {
    } else {
      console.error("Event or currentTarget is undefined");
    }
  };
  // Snapshot of users
  useEffect(() => {
    const userDocRef = doc(getFirestore(), "users", user.uid);

    const unsubscribe = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        const userData = doc.data();
        setLikedTweets(userData.likedTweets || []);
      }
    });

    return () => unsubscribe();
  }, [user.uid]);

  // Snapshot of tweets

  useEffect(() => {
    const unsubscribeTweets = onSnapshot(
      collection(getFirestore(), "tweets"),
      (snapshot) => {
        const tweetsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        tweetsData.sort((a, b) => b.timestamp.seconds - a.timestamp.seconds);

        setTweets(tweetsData);
      }
    );

    return () => {
      unsubscribeTweets();
    };
  }, [user.uid]);

  // Functions --------------------------------------------------------------------

  // Comment Modal
  const openCommentsModal = (tweetId) => {
    setSelectedTweetId(tweetId);
    setIsCommentsModalOpen(true);
    setModalPosition({
      top: window.scrollY,
      left: window.innerWidth / 2 - 250,
    });
  };
  const closeCommentsModal = () => {
    setIsCommentsModalOpen(false);
  };

  // Edit Modal
  const openEditModal = (tweetId, content) => {
    setIdTweetSelected(String(tweetId));
    setEditedTweetContent(content);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditedTweetContent("");
    setIsEditModalOpen(false);
  };

  const handleEditTweet = async (tweetId) => {
    if (!tweetId) {
      console.error("Invalid tweetId:", tweetId);
      return;
    }

    try {
      if (tweetId && editedTweetContent.trim() !== "") {
        const tweetDocRef = doc(getFirestore(), "tweets", String(tweetId));
        const existingTweet = await getDoc(tweetDocRef);

        if (existingTweet.exists()) {
          await updateDoc(tweetDocRef, {
            content: editedTweetContent,
          });

          setEditedTweetContent("");
          closeEditModal();
        }
      }
    } catch (error) {
      console.log(error);
      toast.error("Erreur lors de la mise à jour du tweet :", error);
    }
  };
  // Delete Tweet
  const deleteTweet = async (tweetId) => {
    try {
      const database = getFirestore();
      const tweetRef = doc(database, "tweets", tweetId);
      await deleteDoc(tweetRef);

      const updatedTweets = tweets.filter((tweet) => tweet.id !== tweetId);
      setTweets(updatedTweets);
    } catch (error) {
      toast.error("Error deleting tweet:", error.message);
    }
  };

  // Likes--------------------------------------------------------------
  const updateTweetLikeCount = async (tweetId, increment) => {
    try {
      const tweetDocRef = doc(getFirestore(), "tweets", tweetId);

      const initialSnapshot = await getDoc(tweetDocRef);
      const currentLikeCount = initialSnapshot.data().like || 0;

      await updateDoc(tweetDocRef, {
        like: currentLikeCount + increment,
      });
    } catch (error) {
      toast.error(
        "Erreur lors de la mise à jour du nombre de likes du tweet :",
        error
      );
    }
  };

  const handleLikeToggle = async (tweetId) => {
    try {
      const isLiked = likedTweets.includes(tweetId);
      const updatedLikedTweets = [...likedTweets];

      if (isLiked) {
        const index = updatedLikedTweets.indexOf(tweetId);
        updatedLikedTweets.splice(index, 1);
        await updateTweetLikeCount(tweetId, -1);
      } else {
        updatedLikedTweets.push(tweetId);
        await updateTweetLikeCount(tweetId, 1);
      }

      setLikedTweets(updatedLikedTweets);

      const userDocRef = doc(getFirestore(), "users", user.uid);
      await updateDoc(userDocRef, {
        likedTweets: updatedLikedTweets,
      });
    } catch (error) {
      console.error("Error handling like:", error);
      toast.error(
        "Erreur lors de la gestion du like. Consultez la console pour plus d'informations."
      );
    }
  };
  // All of this come from Home page, for make all the tweets functionnality work in the profil page  from 219 to 291 -------------------
  // Modal --------------------------------------------------------------------
  const openImgEditModal = () => {
    setImgEditModal(true);
  };
  const closeImgEditModal = () => {
    setImgEditModal(false);
  };
  const openDisplayNameEditModal = () => {
    setDisplayNameEditModal(true);
  };
  const closeDisplayNameEditModal = () => {
    setDisplayNameEditModal(false);
  };
  //Effects --------------------------------------------------------------------
  useEffect(() => {
    const fetchMyTweets = async () => {
      try {
        const database = getFirestore();
        const myTweetsQuery = query(
          collection(database, "tweets"),
          where("userId", "==", user.uid)
        );

        const unsubscribe = onSnapshot(myTweetsQuery, (snapshot) => {
          const myTweetsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          myTweetsData.sort(
            (a, b) => b.timestamp.seconds - a.timestamp.seconds
          );

          setMyTweets(myTweetsData);
        });

        return () => unsubscribe();
      } catch (error) {
        console.log(error);
        toast.error("Error fetching your tweets:", error.message);
      }
    };

    fetchMyTweets();
  }, [user.uid]);

  useEffect(() => {
    navigate("/profil");
  }, [navigate]);

  useEffect(() => {
    const fetchUserData = async () => {
      const userDocRef = doc(getFirestore(), "users", user.uid);

      try {
        const docSnapshot = await getDoc(userDocRef);

        if (docSnapshot.exists()) {
          setCurrentUser({ id: docSnapshot.id, ...docSnapshot.data() });
        } else {
          setCurrentUser(null);
        }
      } catch (error) {
        console.error("Error fetching user data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user.uid]);

  // End of the Home imported components --------------------------------------------------------

  // Functions ----------------------------------------------------------------------
  const handleImageSubmit = async (e) => {
    e.preventDefault();

    try {
      setNewDisplayName();
      setNewImageUrl(newImageUrl);

      const userDocRef = doc(getFirestore(), "users", user.uid);
      await updateDoc(userDocRef, {
        userImg: newImageUrl,
      });

      const tweetsCollectionRef = collection(getFirestore(), "tweets");
      const query2 = query(
        tweetsCollectionRef,
        where("userId", "==", user.uid)
      );
      const commentCollectionRef = collection(getFirestore(), "comments");
      const query3 = query(
        commentCollectionRef,
        where("userId", "==", user.uid)
      );

      const querySnapshot = await getDocs(query2);
      const querySnapshot1 = await getDocs(query3);

      querySnapshot.forEach(async (doc2) => {
        const tweetDocRef = doc(getFirestore(), "tweets", doc2.id);
        await updateDoc(tweetDocRef, {
          userImg: newImageUrl,
        });
      });
      querySnapshot1.forEach(async (doc3) => {
        const commentCollectionRef = doc(getFirestore(), "comments", doc3.id);
        await updateDoc(commentCollectionRef, {
          userImg: newImageUrl,
        });
      });

      await updateProfile(auth.currentUser, { photoURL: newImageUrl });

      closeImgEditModal();
      toast.success("Image enregistrée avec succès ! ");
    } catch (error) {
      console.error("Error updating user photoURL: ", error);
      toast.error("une erreur est survenue, consultez la console");
    }
  };
  const handleDisplayNameSubmit = async (e) => {
    e.preventDefault();

    try {
      setNewDisplayName(newDisplayName);

      const userDocRef = doc(getFirestore(), "users", user.uid);
      await updateDoc(userDocRef, {
        userDisplayName: newDisplayName,
      });

      const tweetsCollectionRef = collection(getFirestore(), "tweets");
      const query2 = query(
        tweetsCollectionRef,
        where("userId", "==", user.uid)
      );
      const commentCollectionRef = collection(getFirestore(), "comments");
      const query3 = query(
        commentCollectionRef,
        where("userId", "==", user.uid)
      );

      const querySnapshot = await getDocs(query2);
      const querySnapshot1 = await getDocs(query3);

      querySnapshot.forEach(async (doc2) => {
        const tweetDocRef = doc(getFirestore(), "tweets", doc2.id);
        await updateDoc(tweetDocRef, {
          userDisplayName: newDisplayName,
        });
      });
      querySnapshot1.forEach(async (doc3) => {
        const commentCollectionRef = doc(getFirestore(), "comments", doc3.id);
        await updateDoc(commentCollectionRef, {
          userDisplayName: newDisplayName,
        });
      });

      await updateProfile(auth.currentUser, { displayName: newDisplayName });

      closeDisplayNameEditModal();
      toast.success("pseudo enregistré avec succès ! ");
    } catch (error) {
      console.error("Error updating user displayName: ", error);
      toast.error("une erreur est survenue, consultez la console");
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleString();
  };
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-red-600">
        <ClipLoader color="#1DA1F2" />
      </div>
    );
  }

  return (
    <div className="flex">
      <Nav />
      <div className="h-screen lg:w-2/6 lg:mr-auto mr-10  border-x border-gray-500 overflow-x-hidden overflow-y scrollbar-thin scrollbar-track-slate-700 scrollbar-thumb-slate-700 scrollbar-track-current">
        <div className=" flex items-center ">
          <p className="text-slate-200 mx-3 hover:bg-twitterDark p-2 rounded-full duration-150">
            <NavLink to="/home">
              {" "}
              <ReturnIcon />
            </NavLink>
          </p>

          <p className="py-4 font-semibold text-slate-200 text-2xl">
            {currentUser.userNickName}
          </p>
        </div>
        <div className=" bg-twitterDark h-60"></div>
        <div>
          <div className="flex items-center">
            <img
              className=" w-44 h-44 relative bottom-24 rounded-full bg-black mb-[-60px]"
              src={user.photoURL}
              alt="UserProfil"
            />
            {imgEditModal && (
              <form
                className="flex w-full h-10 items-center"
                onSubmit={handleImageSubmit}
              >
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
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  className="w-auto h-8 px-5 mr-2 ml-2 bg-sky-500 hover:bg-gray-50 rounded-full text-black text-xs font-semibold shadow-lg hover:shadow-xl transition duration-150 disabled:opacity-80 disabled:cursor-wait"
                >
                  Modifier
                </button>
              </form>
            )}
            {imgEditModal === false && (
              <p
                onClick={openImgEditModal}
                className="text-slate-200 hover:text-sky-500 hover:bg-twitterDark rounded-full p-2 hover:cursor-pointer duration-150"
              >
                <EditIcon />
              </p>
            )}

            {imgEditModal && (
              <p
                onClick={closeImgEditModal}
                className="text-slate-200 hover:text-red-500 hover:bg-twitterDark rounded-full p-2 hover:cursor-pointer duration-150"
              >
                <CrossIcon />
              </p>
            )}
          </div>
          <div className="ml-3">
            <div className="flex items-center">
              {displayNameEditModal === false && (
                <>
                  <p className="text-slate-200 font-semibold text-xl ">
                    {user.displayName}
                  </p>
                  <p
                    onClick={openDisplayNameEditModal}
                    className="text-slate-200 hover:text-sky-500 hover:bg-twitterDark rounded-full p-2 ml-2 hover:cursor-pointer duration-150"
                  >
                    <EditIcon />
                  </p>
                </>
              )}
              {displayNameEditModal && (
                <>
                  <form
                    className="flex items-center"
                    onSubmit={handleDisplayNameSubmit}
                  >
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
                      className="customTextarea border border-dashed border-gray-500 h-7  text-gray-500 resize-none"
                      placeholder="Nouveau pseudo... "
                      onChange={(e) => setNewDisplayName(e.target.value)}
                      required
                    />
                    <button
                      type="submit"
                      className="w-auto h-8 px-5 mr-2 ml-2 bg-sky-500 hover:bg-gray-50 rounded-full text-black text-xs font-semibold shadow-lg hover:shadow-xl transition duration-150 disabled:opacity-80 disabled:cursor-wait"
                    >
                      Modifier
                    </button>
                    <p
                      onClick={closeDisplayNameEditModal}
                      className="text-slate-200 hover:text-red-500 hover:bg-twitterDark rounded-full p-2 ml-2 hover:cursor-pointer duration-150"
                    >
                      <CrossIcon />
                    </p>
                  </form>
                </>
              )}
            </div>
            <p className="text-slate-200 font-semibold mb-[-4px] ">
              {currentUser.userAge} ans
            </p>
            <p className="text-gray-500 mb-3">{currentUser.userEmail}</p>
            <p className="text-gray-500">
              Compte crée le {formatTimestamp(currentUser.timestamp)}
            </p>
          </div>
          <div className="border-b mt-3 border-gray-500">
            <p className="py-4 font-semibold text-slate-200 hover:text-sky-500 duration-150  hover:cursor-pointer ">
              mes tweets
            </p>
          </div>
          <div>
            {myTweets.map((tweet) => (
              <div
                key={tweet.id}
                className="tweet-container border-b border-gray-500 py-2 "
              >
                <div className="flex justify-between ">
                  <div className="flex ">
                    <img
                      src={tweet.userImg}
                      alt="profilImage"
                      className="w-10 h-10 mx-2 rounded-full"
                    />
                    <div className="text-slate-600 text-sm flex items-center">
                      <b>
                        <p className="text-slate-200 text-base  ">
                          {tweet.userDisplayName}
                        </p>
                      </b>
                    </div>
                    <div className="text-slate-600 text-sm flex items-center">
                      <p className=" text-lg ml-2">@</p>
                      {tweet.userId.slice(-5)}
                    </div>
                    <p className="text-gray-500 px-2 mt-2">
                      {formatTimestamp(tweet.timestamp)}
                    </p>
                  </div>

                  <div className="flex">
                    {tweet.userId === user.uid && (
                      <div className="flex items-center">
                        <p
                          onClick={() => deleteTweet(tweet.id)}
                          className="text-white px-2 text-sm font-semibold cursor-pointer hover:text-red-500 duration-150"
                        >
                          <TrashIcon />
                        </p>
                        <p
                          onClick={() => openEditModal(tweet.id, tweet.content)}
                          className="text-white px-2 text-sm font-semibold cursor-pointer hover:text-sky-500 duration-150"
                        >
                          <EditIcon />
                        </p>
                      </div>
                    )}
                  </div>
                  {/* Edit modal ---------------------------------------- */}
                  {isEditModalOpen && idTweetSelected === tweet.id && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-slate-600 bg-opacity-50"
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
                        className="w-full max-w-xl bg-black p-8 rounded-lg relative flex flex-col items-center"
                      >
                        <TextareaAutosize
                          className="bg-black text-slate-200 w-full text-2xl resize-none h-auto overflow-hidden"
                          placeholder="Modifier le tweet..."
                          value={editedTweetContent}
                          onChange={(e) =>
                            setEditedTweetContent(e.target.value)
                          }
                          style={{ whiteSpace: "pre-line" }}
                          required
                        />

                        <button
                          onClick={() => handleEditTweet(tweet.id)}
                          className="bg-sky-500 hover:bg-gray-50 rounded-full text-black py-2 px-20 text-lg font-semibold shadow-lg hover:shadow-xl transition duration-150 disabled:opacity-80 disabled:cursor-wait mt-4"
                        >
                          Enregistrer les modifications
                        </button>

                        <button
                          onClick={closeEditModal}
                          className="text-sky-500 hover:text-gray-300 mt-2"
                        >
                          Fermer
                        </button>
                      </motion.div>
                    </div>
                  )}
                </div>
                {/* Comments modal --------------------------------------------------------- */}

                {isCommentsModalOpen && (
                  <>
                    <Comments
                      selectedTweet={tweets.find(
                        (tweet) => tweet.id === selectedTweetId
                      )}
                      onClose={closeCommentsModal}
                    />
                  </>
                )}
                <div className="flex justify-between ">
                  <div
                    className="tweet-content ml-14 text-slate-200 w-[500px]  "
                    style={{ whiteSpace: "pre-wrap" }}
                  >
                    <p className="mb-2">{tweet.content}</p>
                    <img
                      className={` ${
                        tweet.image === "" ? "" : "border border-gray-500"
                      }`}
                      src={tweet.image}
                      alt=""
                    />
                    <div className="flex items-center justify-between">
                      {" "}
                      <div className="flex items-center">
                        <div className="flex">
                          <p
                            onClick={() => openCommentsModal(tweet.id)}
                            className="text-gray-500 text-sm font-semibold hover:text-green-500 hover:cursor-pointer duration-300"
                          >
                            <CommentIcon />
                          </p>
                          <div className="flex items-center ">
                            <span className="px-2 text-sm font-semibold">
                              {tweet.comment}
                            </span>
                          </div>
                        </div>
                        <div
                          className={`flex items-center ${
                            likedTweets.includes(tweet.id)
                              ? "text-red-500"
                              : "text-gray-500"
                          } hover:text-red-500 hover:cursor-pointer duration-300`}
                        >
                          <p
                            className="p-2 text-sm font-semibold"
                            onClick={() => handleLikeToggle(tweet.id)}
                          >
                            <HeartIcon />
                          </p>
                          <p className="">
                            {realTimeLikeCount[tweet.id] || tweet.like}
                          </p>
                        </div>
                      </div>
                      <div>
                        <button
                          onClick={() => openCommentsModal(tweet.id)}
                          className="text-gray-500 px-2 text-sm font-semibold hover:text-green-500 hover:cursor-pointer duration-300"
                        >
                          Afficher les commentaires
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
