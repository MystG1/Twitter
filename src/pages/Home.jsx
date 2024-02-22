import React, { useContext, useState, useEffect } from "react";
import {
  onSnapshot,
  collection,
  doc,
  updateDoc,
  getDoc,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import TextareaAutosize from "react-textarea-autosize";
import CommentIcon from "../components/Icons/CommentIcon";
import HeartIcon from "../components/Icons/heartIcon";
import TrashIcon from "../components/Icons/TrashIcon";
import EditIcon from "../components/Icons/EditIcon";
import { getFirestore } from "firebase/firestore";

import { ClipLoader } from "react-spinners";
import { AuthContext } from "../store/AuthProvider";
import { query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Nav from "../components/Nav/Nav";
import TweetCreation from "../components/TweetCreation/TweetCreation";
import { arrayUnion, arrayRemove } from "firebase/firestore";
import Comments from "../components/Comments/Comments";

// Main component
export default function Home() {
  // States --------------------------------------------------------------
  const [idTweetSelected, setIdTweetSelected] = useState(null);
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
  const [pageSelected, setPageSelected] = useState(1);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserProfile, setSelectedUserProfile] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [refreshWhoToFollow, setRefreshWhoToFollow] = useState(false);
  const navigate = useNavigate();
  const [likedTweets, setLikedTweets] = useState([]);
  const [realTimeLikeCount, setRealTimeLikeCount] = useState({});
  const [comments, setComments] = useState({});
  const [followedTweets, setFollowedTweets] = useState([]);

  const [editedTweetContent, setEditedTweetContent] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
  const [profilModal, setProfilModal] = useState(false);
  const [tweets, setTweets] = useState([]);
  const [loadingTweets, setLoadingTweets] = useState(true);

  const [followedUIDArray, setFollowedUIDArray] = useState([]);

  const [selectedTweetId, setSelectedTweetId] = useState(null);

  useEffect(() => {
    navigate("/home");
  }, [navigate]);

  // Hooks -------------------------------------------------------------
  const { user, loading } = useContext(AuthContext);

  // Effects -----------------------------------------------------------
  // Direct the user to the / when disconnected
  useEffect(() => {
    if (!user && !loading) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  // Detect the click out of a Modal
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
    if (!user || !user.uid) {
      return;
    }

    try {
      const userDocRef = doc(getFirestore(), "users", user.uid);

      const unsubscribe = onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
          const userData = doc.data();
          setLikedTweets(userData.likedTweets || []);
        }
      });

      return () => unsubscribe();
    } catch (error) {
      console.log(error);
      toast.error("Error fetching your tweets:", error.message);
    }
  }, [user, setLikedTweets]);

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
        setLoadingTweets(false);
      }
    );
    //  Snapshot for Followed / Unfollow
    const unsubscribeUsers = onSnapshot(
      collection(getFirestore(), "users"),
      (snapshot) => {
        const usersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setAllUsers(usersData);
        setLoadingUsers(false);

        if (user && user.uid) {
          const currentUser = usersData.find(
            (userData) => userData.id === user.uid
          );

          if (currentUser) {
            const followedUIDArray = currentUser.followedUID || [];
            setFollowedUIDArray(followedUIDArray);
          }
        }
      }
    );

    return () => {
      unsubscribeTweets();
      unsubscribeUsers();
    };
  }, [user, refreshWhoToFollow]);

  // Get tweet from followed users

  useEffect(() => {
    const fetchFollowedTweets = async () => {
      try {
        const database = getFirestore();
        const followedUsersQuery = query(
          collection(database, "tweets"),
          where("userId", "in", followedUIDArray)
        );

        const unsubscribe = onSnapshot(followedUsersQuery, (snapshot) => {
          const followedTweetsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          followedTweetsData.sort(
            (a, b) => b.timestamp.seconds - a.timestamp.seconds
          );

          setFollowedTweets(followedTweetsData);
        });

        return () => unsubscribe();
      } catch (error) {
        toast.error("Error fetching followed tweets:", error.message);
      }
    };

    if (followedUIDArray.length > 0) {
      fetchFollowedTweets();
    } else {
      setFollowedTweets([]);
    }
  }, [followedUIDArray]);

  const myUID = user && user.uid ? user.uid : null;

  // Functions --------------------------------------------------------------------
  // Convert the timestamp to a string
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleString();
  };
  // Comment Modal
  const openCommentsModal = (tweetId) => {
    const selectedTweet =
      pageSelected === 1
        ? tweets.find((tweet) => tweet.id === tweetId)
        : followedTweets.find((tweet) => tweet.id === tweetId);

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
  // Profil Modal
  const openProfilModal = (userId) => {
    const selectedUser = allUsers.find((user) => user.id === userId);
    setSelectedUserProfile(selectedUser);
    setProfilModal(true);
  };

  const closeProfilModal = () => {
    setSelectedUserProfile(null);
    setProfilModal(false);
  };

  // Edit Tweet function
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

  // Follow User
  const followUser = async (followedUserId) => {
    try {
      const database = getFirestore();
      const userDocRef = doc(database, "users", user.uid);

      await updateDoc(userDocRef, {
        followedUID: arrayUnion(followedUserId),
      });

      toast.success("Vous suivez maintenant cet utilisateur.");
      setRefreshWhoToFollow(true);
    } catch (error) {
      toast.error("Une erreur est survenue lors du suivi :", error.message);
    }
  };
  // UnFollow User
  const unfollowUser = async (followedUserId) => {
    try {
      const database = getFirestore();
      const userDocRef = doc(database, "users", user.uid);

      await updateDoc(userDocRef, {
        followedUID: arrayRemove(followedUserId),
      });

      toast.error("Vous ne suivez plus cet utilisateur.");
      setRefreshWhoToFollow(true);
    } catch (error) {
      toast.error(
        "Une erreur est survenue lors du désabonnement :",
        error.message
      );
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
  // Add a tweet or remove it
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

  // Loader

  if (loading || loadingTweets) {
    return (
      <div className="flex justify-center items-center h-screen text-red-600">
        <ClipLoader color="#1DA1F2" />
      </div>
    );
  }
  user;

  // JSX --------------------------------------------------------
  return (
    <div className="flex lg:mr-auto mr-10 ">
      <Nav />
      <div className="lg:mx-20  h-screen lg:w-2/6   border-x border-gray-500 overflow-x-hidden overflow-y scrollbar-thin scrollbar-track-slate-700 scrollbar-thumb-slate-700 scrollbar-track-current">
        <div className="flex justify-between border-b border-gray-500 box-content position-sticky">
          <p
            onClick={() => setPageSelected(1)}
            className={`py-4 ml-28 font-semibold hover:bg-twitterDark duration-150 hover:px-28 hover:ml-0 hover:cursor-pointer ${
              pageSelected === 1 ? "text-sky-400" : "text-gray-500"
            }`}
          >
            Pour toi
          </p>
          <p
            onClick={() => setPageSelected(2)}
            className={`text-gray-500 py-4 mr-28 font-semibold hover:bg-twitterDark duration-150 hover:px-28 hover:mr-0 hover:cursor-pointer ${
              pageSelected === 2 ? "text-sky-400" : "text-gray-500"
            }`}
          >
            Suivis
          </p>
        </div>
        <div>
          {(pageSelected === 1 || pageSelected === 2) && (
            <>
              <TweetCreation />
              <motion.div
                key={pageSelected}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                {user &&
                  (pageSelected === 1 ? tweets : followedTweets).map(
                    (tweet, index) => (
                      <div
                        key={tweet.id}
                        className="tweet-container border-b border-gray-500 py-2 "
                      >
                        <div className="flex justify-between">
                          <div className="flex ">
                            <div
                              onClick={() => openProfilModal(tweet.userId)}
                              className="hover:cursor-pointer flex"
                            >
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
                                  onClick={() =>
                                    openEditModal(tweet.id, tweet.content)
                                  }
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

                        {profilModal && selectedUserProfile && (
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
                              className="w-full max-w-xl bg-black  rounded-lg relative flex flex-col "
                            >
                              <div>
                                <p className=" p-5 text-slate-200 text-2xl font-semibold">
                                  {selectedUserProfile.userNickName}
                                </p>

                                <div className=" bg-twitterDark h-60"></div>
                                <div className="flex items-center justify-between">
                                  <img
                                    className=" w-44 h-44 relative bottom-24 rounded-full bg-black mb-[-60px]"
                                    src={selectedUserProfile.userImg}
                                    alt="UserProfil"
                                  />
                                  {selectedUserProfile.userId !== user.uid ? (
                                    <>
                                      {followedUIDArray.includes(
                                        selectedUserProfile.userId
                                      ) ? (
                                        <div className="border-2 border-slate-200 rounded-full p-[2px] mr-3 hover:border-red-600  transition duration-150">
                                          <button
                                            type="submit"
                                            onClick={() =>
                                              unfollowUser(
                                                selectedUserProfile.userId
                                              )
                                            }
                                            className="switchContent flex items-center h-8 px-5 text-slate-200 bg-sky-500 hover:bg-red-400 hover:bg-opacity-20 hover:text-red-600 rounded-full text-black text-base font-semibold shadow-lg hover:shadow-xl transition duration-150 disabled:opacity-80 disabled:cursor-wait"
                                          >
                                            Suivis
                                          </button>
                                        </div>
                                      ) : (
                                        <div className="border-2 rounded-full p-[2px] mr-3">
                                          <button
                                            type="submit"
                                            onClick={() =>
                                              followUser(
                                                selectedUserProfile.userId
                                              )
                                            }
                                            className="h-8 px-5 text-slate-200 bg-twitterDark hover:bg-sky-500 rounded-full text-black text-base font-semibold shadow-lg hover:shadow-xl transition duration-150 disabled:opacity-80 disabled:cursor-wait"
                                          >
                                            Suivre
                                          </button>
                                        </div>
                                      )}
                                    </>
                                  ) : null}
                                </div>
                                <div className="ml-3">
                                  <div className="flex items-center"></div>
                                  <p className="text-slate-200 font-semibold ">
                                    {selectedUserProfile.userDisplayName}
                                  </p>
                                  <p className="text-slate-200 font-semibold mb-[-4px] ">
                                    {selectedUserProfile.userAge} ans
                                  </p>
                                  <p className="text-gray-500 mb-3">
                                    {selectedUserProfile.userEmail}
                                  </p>
                                  <p className="text-gray-500">
                                    Compte crée le{" "}
                                    {formatTimestamp(
                                      selectedUserProfile.timestamp
                                    )}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={closeProfilModal}
                                className="text-sky-500 hover:text-gray-300 mt-5 mb-3"
                              >
                                Fermer
                              </button>
                            </motion.div>
                          </div>
                        )}
                        <div className="flex justify-between ">
                          <div
                            className="tweet-content ml-14 text-slate-200 w-[500px]  "
                            style={{ whiteSpace: "pre-wrap" }}
                          >
                            <p className="mb-2">{tweet.content}</p>
                            <img
                              className={` ${
                                tweet.image === ""
                                  ? ""
                                  : "border border-gray-500"
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
                    )
                  )}
              </motion.div>
            </>
          )}
        </div>
      </div>
      <div className=" h-full mt-3 lg:block hidden">
        <div className=" bg-twitterDark w-full h-full rounded-3xl">
          <p className=" text-slate-200 text-2xl font-semibold p-5">
            Who to follow
          </p>
          <div className="flex flex-col gap-2 p-4">
            {loadingUsers ? (
              <ClipLoader color="#1DA1F2" />
            ) : (
              allUsers
                .filter((user) => user.id !== myUID)
                .map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-2 justify-between mb-7"
                  >
                    <div className="flex items-center">
                      <img
                        src={user.userImg}
                        alt="User Avatar"
                        className="w-8 h-8  mr-3"
                      />
                      <div>
                        <p className="text-slate-200 font-semibold">
                          {user.userDisplayName}
                        </p>
                        <div className="text-slate-600 text-sm flex items-center">
                          {user.userDisplayName}
                          <p className="text-xl ml-2">@</p>
                          {user.userId.slice(-5)}
                        </div>
                      </div>
                    </div>
                    {followedUIDArray.includes(user.id) ? (
                      <div className="border-2 border-slate-200 rounded-full p-[2px] hover:border-red-600  transition duration-150">
                        <button
                          type="submit"
                          onClick={() => unfollowUser(user.id)}
                          className="switchContent flex items-center h-8 px-5 text-slate-200 bg-sky-500 hover:bg-red-400 hover:bg-opacity-20 hover:text-red-600 rounded-full text-black text-base font-semibold shadow-lg hover:shadow-xl transition duration-150 disabled:opacity-80 disabled:cursor-wait"
                        >
                          Suivis
                        </button>
                      </div>
                    ) : (
                      <div className="border-2 rounded-full p-[2px]">
                        <button
                          type="submit"
                          onClick={() => followUser(user.id)}
                          className="h-8 px-5 text-slate-200 bg-twitterDark hover:bg-sky-500 rounded-full text-black text-base font-semibold shadow-lg hover:shadow-xl transition duration-150 disabled:opacity-80 disabled:cursor-wait"
                        >
                          Suivre
                        </button>
                      </div>
                    )}
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
