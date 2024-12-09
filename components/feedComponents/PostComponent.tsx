import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Share,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import PostDetailsModal from "./PostDetailsModal";
import { UserType } from "@/enums/UserType";
import Button from "../baseComponets/Button";
import { router } from "expo-router";
import {
  getOrgVolIdByToken,
  getUserTypeByToken,
} from "@/services/managers/TokenManager";
import { PostList } from "@/models/viewModels/PostList";

type Props = {
  post: PostList;
  onPressLike: any;
  onPressShare: any;
  myPost: boolean;
  onPressDelete: any;
  onChange: any;
};

export default function PostComponent(props: Props) {
  const [isPostDetailsModalVisible, setIsPostDetailsModalVisible] =
    useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };

  const openPostDetailsModal = () => {
    setIsPostDetailsModalVisible(true);
  };

  const closePostDetailsModal = () => {
    setIsPostDetailsModalVisible(false);
  };

  const convertUserTypeName = (userType: UserType) => {
    if (userType == UserType.VOLUNTEER) {
      return "Voluntário";
    } else {
      return "Organização";
    }
  };

  const handleDeletePost = async () => {
    props.onPressDelete();
    setShowOptions(false);
  };

  const openProfile = async () => {
    const currentUserId = await getOrgVolIdByToken();
    if (props.post.authorId == currentUserId) {
      router.push("/screens/(tabs)/(profile)/profile");
    } else {
      router.push({
        pathname: "/screens/(tabs)/(profile)/profile/[id]",
        params: {
          id: props.post.authorId,
          userType: props.post.authorType,
          pageFrom: "feed",
        },
      });
    }
  };

  const handleShareOptions = async () => {
    try {
      const result = await Share.share({
        message: `Confira essa postagem`,
        url: "https://linka.app/post/" + props.post,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // Compartilhado com uma atividade específica
        } else {
          // Compartilhado diretamente
        }
      } else if (result.action === Share.dismissedAction) {
        // Compartilhamento foi cancelado
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível compartilhar o post.");
    }
  };

  return (
    <View style={styles.postContainer}>
      <TouchableOpacity onPress={openProfile} style={styles.header}>
        {props.post.authorImageProfile != undefined ? (
          <Image
            source={{
              uri: `data:image/png;base64,${props.post.authorImageProfile}`,
            }}
            style={styles.profileImage}
          />
        ) : (
          <Image
            source={require("@/assets/images/genericalProfilePhoto.jpg")}
            style={styles.profileImage}
          />
        )}
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{props.post.authorDisplayName}</Text>
          <Text style={styles.userType}>
            {convertUserTypeName(props.post.authorType)}
          </Text>
        </View>
      </TouchableOpacity>

      {props.myPost && (
        <TouchableOpacity onPress={toggleOptions} style={styles.optionsIcon}>
          <Ionicons name="ellipsis-vertical" size={18} color={Colors.black} />
        </TouchableOpacity>
      )}

      {showOptions && (
        <View style={styles.optionsMenu}>
          <Button
            title="Deletar"
            textColor={Colors.red}
            iconName="trash-outline"
            width={70}
            height={20}
            borderColor={Colors.white}
            backgroundColor={Colors.white}
            borderRadius={15}
            onPress={() => handleDeletePost()}
          />
        </View>
      )}

      {props.post.associatedOrganizationDisplayName && (
        <Text style={styles.releatedOrg} numberOfLines={1} ellipsizeMode="tail">
          <Text style={styles.bold}>Relacionado com: </Text>
          {props.post.associatedOrganizationDisplayName}
        </Text>
      )}

      <Text style={styles.description} numberOfLines={2} ellipsizeMode="tail">
        {props.post.description}
      </Text>

      <TouchableOpacity onPress={openPostDetailsModal}>
        <Text style={styles.readMore}>Ler mais</Text>
      </TouchableOpacity>

      {props.post.imageBase64 != undefined && (
        <Image
          source={{ uri: `data:image/png;base64,${props.post.imageBase64}` }}
          style={styles.postImage}
        />
      )}

      <View style={styles.footer}>
        <TouchableOpacity
          onPress={props.onPressLike}
          style={styles.iconContainer}
        >
          <Ionicons
            name="heart"
            size={24}
            color={props.post.currentUserHasLiked ? Colors.red : Colors.gray}
          />
          <Text
            style={[
              styles.iconText,
              {
                color: props.post.currentUserHasLiked
                  ? Colors.red
                  : Colors.gray,
              },
            ]}
          >
            {props.post.likeCount}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={openPostDetailsModal}
          style={styles.iconContainer}
        >
          <Ionicons name="chatbox-ellipses" size={24} color={Colors.gray} />
          <Text style={styles.iconText}>{props.post.commentCount}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={props.onPressShare}
          style={styles.iconContainer}
        >
          <Ionicons
            name="repeat"
            size={24}
            color={
              props.post.currentUserHasShared ? Colors.orange : Colors.gray
            }
          />
          <Text
            style={[
              styles.iconText,
              {
                color: props.post.currentUserHasShared
                  ? Colors.orange
                  : Colors.gray,
              },
            ]}
          >
            {props.post.shareCount}
          </Text>
        </TouchableOpacity>

        {isPostDetailsModalVisible && (
          <PostDetailsModal
            visible={isPostDetailsModalVisible}
            onClose={closePostDetailsModal}
            post={props.post}
            onPressLike={(id: string) => props.onPressLike(id)}
            onPressShare={(id: string) => props.onPressShare(id)}
            myPost={props.myPost}
            onChange={() => props.onChange()}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  postContainer: {
    padding: 10,
    margin: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: Colors.mediumGray,
    marginRight: 10,
  },
  userInfo: {
    justifyContent: "center",
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.black,
    marginBottom: 3,
  },
  userType: {
    fontSize: 14,
    color: Colors.gray,
  },
  description: {
    fontSize: 14,
    color: Colors.black,
    marginBottom: 5,
  },
  readMore: {
    color: Colors.orange,
    fontSize: 12,
    alignSelf: "flex-end",
    textDecorationLine: "underline",
    marginBottom: 10,
  },
  postImage: {
    width: "100%",
    height: 200,
    borderBottomStartRadius: 10,
    borderBottomEndRadius: 10,
    marginBottom: 10,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconText: {
    fontSize: 14,
    color: Colors.gray,
    marginLeft: 5,
    marginRight: 10,
  },
  shareIcon: {
    marginLeft: "auto",
  },
  optionsIcon: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  optionsMenu: {
    position: "absolute",
    top: 30,
    right: 10,
    backgroundColor: Colors.white,
    padding: 10,
    marginTop: 5,
    marginRight: 5,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  releatedOrg: {
    fontSize: 12,
    color: Colors.gray,
    marginBottom: 10,
    marginTop: 5,
  },
  bold: {
    fontWeight: "bold",
  },
});
