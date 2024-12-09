import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import ProfilePostCard from './ProfilePostCard';
import { PostList } from '@/models/viewModels/PostList';

type Props = {
  posts: PostList[];
  onPress: any;
}

export default function ProfilePostList(props: Props) {
  const latestPosts = props.posts.slice(0, 3);

  return (
    <ScrollView>
      {latestPosts.length > 0 ? (
        latestPosts.map((item) => (
          <TouchableOpacity onPress={() => props.onPress(item.id)} key={item.id}>
            <ProfilePostCard
              postImageUrl={item.imageBase64}
              postDescription={item.description}
              postTimeAgo={'2 dias atrás'}
            />
          </TouchableOpacity>
        ))
      ) : (
        <View style={{ alignItems: 'center', marginTop: 20 }}>
          <Text>Nenhuma publicação realizada</Text>
        </View>
      )}
    </ScrollView>
  );
}
