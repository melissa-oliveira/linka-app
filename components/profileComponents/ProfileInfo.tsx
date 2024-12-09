import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { Colors } from "@/constants/Colors";
import { UserType } from "@/enums/UserType";
import { MinPointsShieldLevels } from "@/enums/MinPointsShieldLevels";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  username: string;
  userFirstName: string;
  userSurename: string;
  userProfileImageUrl: any;
  userType: string;
  userFollowers: string;
  userAllPoints?: number;
};

export default function ProfileInfo(props: Props) {
  const returnShieldColor = (points: number): string => {
    if (points >= MinPointsShieldLevels.DIAMOND) {
      return Colors.diamond;
    } else if (points >= MinPointsShieldLevels.GOLD) {
      return Colors.gold;
    } else if (points >= MinPointsShieldLevels.SILVER) {
      return Colors.silver;
    } else {
      return Colors.bronze;
    }
  };

  return (
    <View style={styles.postContainer}>
      <View style={styles.header}>
        <Image source={props.userProfileImageUrl} style={styles.profileImage} />
        {props.userType == "Voluntário" && (
          <View style={styles.volunteerShield}>
            <Ionicons
              name="shield"
              size={40}
              color={returnShieldColor(props.userAllPoints || 0)}
            />
          </View>
        )}
        <View style={styles.userInfo}>
          <Text style={styles.userType}>{props.userType}</Text>
          <Text style={styles.username}>@{props.username}</Text>
          <Text
            style={styles.userFullName}
          >{`${props.userFirstName} ${props.userSurename}`}</Text>
          <Text style={styles.userFollowers}>
            {props.userFollowers}{" "}
            {props.userType == "Voluntário" ? "Conexões" : "Seguidores"}
          </Text>
          {props.userType == "Voluntário" && (
            <Text style={styles.userPoints}>
              {props.userAllPoints || 0} pontos
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  postContainer: {
    paddingBottom: 10,
    paddingHorizontal: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: Colors.mediumGray,
    marginRight: 10,
  },
  userInfo: {
    justifyContent: "center",
    alignItems: "flex-end",
  },
  username: {
    marginBottom: 13,
    fontSize: 12,
  },
  userFollowers: {
    fontWeight: "bold",
    fontSize: 16,
  },
  userFullName: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.black,
    marginBottom: 5,
  },
  userType: {
    fontSize: 12,
    color: Colors.gray,
    marginBottom: 3,
  },
  userPoints: {
    fontSize: 16,
    color: Colors.gray,
    marginTop: 5,
  },
  volunteerShield: {
    marginLeft: -110,
    marginRight: 5,
    marginTop: 70,
  },
});
