import { Colors } from "@/constants/Colors";
import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";

type Props = {
  rewardImageUrl: any;
  rewardTitle: string;
  rewardPoints: string;
  rewardQtn: string;
  onPress?: () => void;
};

export default function RewardCard(props: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={props.onPress}>
      {props.rewardImageUrl == '' || props.rewardImageUrl == undefined || props.rewardImageUrl == null ? (
        <Image source={require('@/assets/images/generalGraySquare.png')} style={styles.image} />
      ) : (
        <Image source={{ uri: `data:image/png;base64,${props.rewardImageUrl}` }} style={styles.image} />
      )}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          {props.rewardTitle}
        </Text>
        <Text style={styles.points}>{props.rewardPoints}</Text>
        <Text style={styles.quantity}>Disponível: {props.rewardQtn}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    width: 144,
    marginBottom: 15,
    marginRight: 10,
  },
  image: {
    width: "100%",
    height: 130,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  info: {
    padding: 10,
    backgroundColor: Colors.lightGray,
    borderBottomEndRadius: 10,
    borderBottomStartRadius: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: Colors.black,
  },
  points: {
    fontSize: 14,
    color: Colors.black,
    marginBottom: 5,
  },
  quantity: {
    fontSize: 12,
    color: Colors.gray,
  },
});
