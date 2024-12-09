import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

type Props = {
  postImageUrl: any,
  postDescription: string,
  postTimeAgo: string,
};

export default function ProfilePostCard(props: Props) {
  return (
    <View style={styles.container}>
      {props.postImageUrl != undefined && <Image source={{ uri: `data:image/png;base64,${props.postImageUrl}` }} style={styles.image} />}
      <View style={styles.textContainer}>
        <Text style={styles.description} numberOfLines={1} ellipsizeMode="tail">
          {props.postDescription}
        </Text>
        <Text style={styles.timeAgo}>{props.postTimeAgo}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  image: {
    width: 70,
    height: 60,
    borderRadius: 10,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  description: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  timeAgo: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
});
