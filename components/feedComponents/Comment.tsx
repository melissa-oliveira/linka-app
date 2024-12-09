import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Colors } from "@/constants/Colors";
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import Button from '../baseComponets/Button';
import { deleteComment } from '@/services/comment.service';

type CommentProps = {
    userName: string;
    userImageUrl: string | null;
    commentText: string;
    myComment: boolean;
    onPressDelete: any,
};

const Comment = ({ userName, userImageUrl, commentText, myComment, onPressDelete }: CommentProps) => {
    const [showOptions, setShowOptions] = useState(false);

    const toggleOptions = () => {
        setShowOptions(!showOptions);
    };

    const handleDeleteComment = async () => {
        onPressDelete();
        setShowOptions(false);
    };

    return (
        <View style={styles.commentContainer}>
            {userImageUrl == null
                ? <Image source={require('@/assets/images/genericalProfilePhoto.jpg')} style={styles.commentProfileImage} />
                : <Image source={{ uri: `data:image/png;base64,${userImageUrl}` }} style={styles.commentProfileImage} />
            }
            <View style={styles.commentTextContainer}>
                <Text style={styles.commentUserName}>{userName}</Text>
                <Text style={styles.commentText}>{commentText}</Text>
            </View>

            {myComment && (
                <TouchableOpacity onPress={toggleOptions} style={styles.optionsIcon}>
                    <Ionicons name="ellipsis-vertical" size={18} color={Colors.black} />
                </TouchableOpacity>
            )}

            {showOptions && (
                <View style={styles.optionsMenu}>
                    <Button
                        title='Deletar'
                        textColor={Colors.red}
                        iconName='trash-outline'
                        width={70}
                        height={20}
                        borderColor={Colors.white}
                        backgroundColor={Colors.white}
                        borderRadius={15}
                        onPress={() => handleDeleteComment()}
                    />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    commentContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginVertical: 10,
        position: 'relative',
    },
    commentProfileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    commentTextContainer: {
        flex: 1,
        backgroundColor: Colors.lightGray,
        borderRadius: 10,
        padding: 10,
    },
    commentUserName: {
        fontWeight: 'bold',
        fontSize: 14,
        color: Colors.black,
    },
    commentText: {
        fontSize: 14,
        color: Colors.gray,
        marginTop: 5,
    },
    optionsIcon: {
        position: 'absolute',
        top: 10,
        right: 10,
    },
    optionsMenu: {
        position: 'absolute',
        top: 30,
        right: 10,
        backgroundColor: Colors.white,
        padding: 10,
        marginTop: 5,
        marginRight: 5,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    deleteOption: {
        color: Colors.red,
        fontSize: 14,
    },
});

export default Comment;
