import React, { useEffect, useState } from "react";
import Header from "@/components/baseComponets/Header";
import { Colors } from "@/constants/Colors";
import {
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import PostComponent from "@/components/feedComponents/PostComponent";
import {
  deletePost,
  getAllPosts,
  likePost,
  sharePost,
  unlikePost,
  unsharePost,
} from "@/services/post.service";
import { PostList } from "@/models/viewModels/PostList";
import { UserType } from "@/enums/UserType";
import { getVolunteer } from "@/services/volunteer.service";
import { getOrganization } from "@/services/organization.service";
import Button from "@/components/baseComponets/Button";
import { getOrgVolIdByToken } from "@/services/managers/TokenManager";

const Feed = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [posts, setPosts] = useState<PostList[]>();
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [postIdToDelete, setPostIdToDelete] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>("");
  const [confirmRepostVisible, setConfirmRepostVisible] = useState(false);
  const [postIdToRepost, setPostIdToRepost] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        await fetchPosts();
        await fetchUserId();
      } catch (error) {
        console.error(error);
      }
    };
    fetchUser();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  const fetchUserId = async () => {
    const id = await getOrgVolIdByToken();
    id && setUserId(id);
  };

  const confirmRepostPost = (postId: string) => {
    setPostIdToRepost(postId);
    setConfirmRepostVisible(true);
  };

  const fetchPosts = async () => {
    try {
      const allPosts = await getAllPosts();

      setPosts(allPosts.data);

      const postsWithImages = await Promise.all(
        allPosts.data.map(async (post: PostList) => {
          let authorDetails;
          let orgRelatedDatais = { name: "" };

          if (post.authorType === UserType.ORGANIZATION) {
            authorDetails = await fetchOrganizationDetails(post.authorId);
          } else {
            authorDetails = await fetchVolunteerDetails(post.authorId);
            orgRelatedDatais = await fetchOrganizationDetails(
              post.associatedOrganizationId
            );
          }

          return {
            ...post,
            associatedOrganizationDisplayName: orgRelatedDatais.name,
            authorImageProfile: authorDetails.profilePictureBase64,
          };
        })
      );

      setPosts(postsWithImages);
    } catch (e) {
      console.error("LINKA-LOG: Error loading posts");
    }
  };

  const fetchVolunteerDetails = async (id: string) => {
    try {
      const volunteer = await getVolunteer(id);
      return {
        name: volunteer.name,
        profilePictureBase64: volunteer.profilePictureBase64,
      };
    } catch (e) {
      console.error("LINKA-LOG: Error loading volunteer");
      return { name: "", profilePictureBase64: "" };
    }
  };

  const fetchOrganizationDetails = async (id: string) => {
    try {
      const organization = await getOrganization(id);
      return {
        name: organization.tradingName,
        profilePictureBase64: organization.profilePictureBase64,
      };
    } catch (e) {
      console.error("LINKA-LOG: Error loading organization");
      return { name: "", profilePictureBase64: "" };
    }
  };

  const handleLike = async (postId: string) => {
    try {
      await likePost(postId);

      setPosts((prevPosts) => {
        if (!prevPosts) return prevPosts;

        return prevPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                currentUserHasLiked: true,
                likeCount: post.likeCount + 1,
                liked: true,
              }
            : post
        );
      });
    } catch (e) {
      Alert.alert("Ops...", "Ocorreu um erro. Tente curtir novamente.");
      console.error("LINKA-LOG: Error during like");
    }
  };

  const handleUnlike = async (postId: string) => {
    try {
      await unlikePost(postId);

      setPosts((prevPosts) => {
        if (!prevPosts) return prevPosts;

        return prevPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                currentUserHasLiked: false,
                likeCount: post.likeCount > 0 ? post.likeCount - 1 : 0,
              }
            : post
        );
      });
    } catch (e) {
      Alert.alert(
        "Ops...",
        "Ocorreu um erro. Tente remover a curtida novamente."
      );
      console.error("LINKA-LOG: Error during unlike");
    }
  };

  const handleShare = async (postId: string) => {
    try {
      await sharePost(postId);

      setPosts((prevPosts) => {
        if (!prevPosts) return prevPosts;

        return prevPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                currentUserHasShared: true,
                shareCount: post.shareCount + 1,
                shared: true,
              }
            : post
        );
      });
    } catch (e) {
      Alert.alert("Ops...", "Ocorreu um erro. Tente compartilhar novamente.");
      console.error("LINKA-LOG: Error during share");
    }
  };

  const handleUnshare = async (postId: string) => {
    try {
      await unsharePost(postId);

      setPosts((prevPosts) => {
        if (!prevPosts) return prevPosts;

        return prevPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                currentUserHasShared: false,
                shareCount: post.shareCount > 0 ? post.shareCount - 1 : 0,
              }
            : post
        );
      });
    } catch (e) {
      Alert.alert(
        "Ops...",
        "Ocorreu um erro. Tente remover o compartilhamento novamente."
      );
      console.error("LINKA-LOG: Error during unshare");
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await deletePost(postId);

      setPosts((prevPosts) => {
        if (!prevPosts) return prevPosts;

        return prevPosts.filter((post) => post.id !== postId);
      });
    } catch (e) {
      console.error("LINKA-LOG: Error deleting post", e);
      Alert.alert(
        "Ops...",
        "Não foi possível deletar seu post. Tente de novo."
      );
    }
  };

  const handleConfirmDeletePost = () => {
    if (postIdToDelete) {
      handleDeletePost(postIdToDelete);
      setConfirmDeleteVisible(false);
      setPostIdToDelete(null);
    }
  };

  const confirmDeletePost = (postId: string) => {
    setPostIdToDelete(postId);
    setConfirmDeleteVisible(true);
  };

  return (
    <View style={styles.pageColor}>
      <Header pageFrom="feed" />

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.orange, Colors.orange]}
          />
        }
      >
        <View style={styles.container}>
          {posts &&
            posts.map((post, index) => (
              <PostComponent
                key={index}
                post={post}
                onPressLike={
                  post.currentUserHasLiked
                    ? () => handleUnlike(post.id)
                    : () => handleLike(post.id)
                }
                onPressShare={
                  post.currentUserHasShared
                    ? () => handleUnshare(post.id)
                    : () => confirmRepostPost(post.id)
                }
                myPost={post.authorId == userId ? true : false}
                onPressDelete={() => confirmDeletePost(post.id)}
                onChange={() => fetchPosts()}
              />
            ))}
        </View>

        <Modal
          animationType="fade"
          transparent={true}
          visible={confirmDeleteVisible}
          onRequestClose={() => setConfirmDeleteVisible(false)}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>
                Você realmente deseja deletar seu post?
              </Text>
              <Text style={styles.modalText}>
                Esta ação não pode ser revertida
              </Text>
              <View style={styles.modalButtonContainer}>
                <Button
                  title="Sim"
                  onPress={() => handleConfirmDeletePost()}
                  backgroundColor={Colors.red}
                  textColor={Colors.white}
                  borderColor={Colors.red}
                  borderRadius={15}
                  width={125}
                  height={35}
                />
                <Button
                  title="Não"
                  onPress={() => setConfirmDeleteVisible(false)}
                  backgroundColor={Colors.gray}
                  textColor={Colors.white}
                  borderColor={Colors.gray}
                  borderRadius={15}
                  width={125}
                  height={35}
                />
              </View>
            </View>
          </View>
        </Modal>
        <Modal
          animationType="fade"
          transparent={true}
          visible={confirmRepostVisible}
          onRequestClose={() => setConfirmRepostVisible(false)}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>
                Você realmente deseja repostar este post?
              </Text>
              <Text style={styles.modalText}>
                Confirme para compartilhar este conteúdo com sua rede.
              </Text>
              <View style={styles.modalButtonContainer}>
                <Button
                  title="Sim"
                  onPress={() => {
                    if (postIdToRepost) {
                      handleShare(postIdToRepost);
                    }
                    setConfirmRepostVisible(false);
                  }}
                  backgroundColor={Colors.orange}
                  textColor={Colors.white}
                  borderColor={Colors.orange}
                  borderRadius={15}
                  width={125}
                  height={35}
                />
                <Button
                  title="Não"
                  onPress={() => setConfirmRepostVisible(false)}
                  backgroundColor={Colors.gray}
                  textColor={Colors.white}
                  borderColor={Colors.gray}
                  borderRadius={15}
                  width={125}
                  height={35}
                />
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  pageColor: {
    backgroundColor: Colors.white,
    flex: 1,
  },
  container: {
    backgroundColor: Colors.white,
    padding: 10,
    marginBottom: 75,
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  modalContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.white,
    padding: 30,
    borderRadius: 15,
    height: 175,
    width: "85%",
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 3,
    textAlign: "center",
    color: Colors.black,
  },
  modalText: {
    fontSize: 14,
    marginBottom: 25,
    textAlign: "center",
    color: Colors.gray,
  },
  modalButtonContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-around",
  },
});

export default Feed;
