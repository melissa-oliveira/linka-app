import React, { useEffect, useState } from 'react';
import { Modal, View, Text, Image, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from "@/constants/Colors";
import Comment from "@/components/feedComponents/Comment";
import { addComment, deleteComment, getCommentsByPostId } from '@/services/comment.service';
import { PostCommentCreate } from '@/models/viewModels/PostCommentCreate';
import { CommentList } from '@/models/viewModels/CommentList';
import { getVolunteer } from '@/services/volunteer.service';
import { getOrganization } from '@/services/organization.service';
import { UserType } from '@/enums/UserType';
import { getOrgVolIdByToken, getUserTypeByToken, getValidDecodedToken } from '@/services/managers/TokenManager';
import Button from '../baseComponets/Button';
import { deletePost } from '@/services/post.service';
import { router } from 'expo-router';
import { PostList } from '@/models/viewModels/PostList';

type PostDetailsModalProps = {
    post: PostList
    visible: boolean;
    onClose: () => void;
    onPressLike: any;
    onPressShare: any;
    myPost: boolean,
    onChange: any,
};

const PostDetailsModal = (props: PostDetailsModalProps) => {

    const [comments, setComments] = useState<CommentList[]>([]);
    const [comentario, setComentario] = useState('');
    const [profileImage, setProfileImage] = useState<string | null>();
    const [userId, setUserId] = useState<string>('');
    const [confirmDeletePostVisible, setConfirmDeletePostVisible] = useState(false);
    const [postIdToDelete, setPostIdToDelete] = useState<string | null>(null);
    const [confirmDeleteCommentVisible, setConfirmDeleteCommentVisible] = useState(false);
    const [commentIdToDelete, setCommentIdToDelete] = useState<string | null>(null);
    const [showOptions, setShowOptions] = useState(false);

    useEffect(() => {
        const initialFetch = async () => {
            try {
                await fetchUserProfileImage();
                await fetchComments();
            } catch (error) {
                console.error(error);
            }
        };
        initialFetch();
    }, [props.post]);

    const fetchUserProfileImage = async () => {
        const currentUserType = await getUserTypeByToken();
        const currentId = await getOrgVolIdByToken();
        if (currentId && currentUserType) {
            setUserId(currentId);
            let image = undefined;
            if (currentUserType == 'volunteer')
                image = await fetchVolunteerImage(currentId);
            else
                image = await fetchOrganizationImage(currentId);
            image != undefined && setProfileImage(image);
        }
    }

    const fetchComments = async () => {
        try {
            const allComments = await getCommentsByPostId(props.post.id);
            setComments(allComments.data);

            const commentsWithImages = await Promise.all(allComments.data.map(async (comment: CommentList) => {
                const authorImageProfile = comment.type == 1
                    ? await fetchOrganizationImage(comment.authorId)
                    : await fetchVolunteerImage(comment.authorId);

                return {
                    ...comment,
                    authorImageProfile: authorImageProfile,
                };
            }));

            setComments(commentsWithImages);

        } catch (e) {
            console.error('LINKA-LOG: Error loading comments');
        }
    }

    const fetchVolunteerImage = async (id: string) => {
        try {
            const volunteer = await getVolunteer(id);
            return volunteer.profilePictureBase64;
        } catch (e) {
            console.error('LINKA-LOG: Error loading volunteer');
        }
    }

    const fetchOrganizationImage = async (id: string) => {
        try {
            const organization = await getOrganization(id);
            return organization.profilePictureBase64;
        } catch (e) {
            console.error('LINKA-LOG: Error loading organization');
        }
    }

    const handleSendComment = async () => {
        if (comentario.trim()) {
            try {
                const comment: PostCommentCreate = {
                    content: comentario,
                    postId: props.post.id
                }
                await addComment(comment);
                await fetchComments();
            } catch (e) {
                console.error('LINKA-LOG: Error during like');
                Alert.alert('Ops..', 'Não foi possível publicar seu comentário. Tente de novo.');
            }
            setComentario('');
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        try {
            await deleteComment(commentId);

            setComments((prevComments) => {
                if (!prevComments) return prevComments;

                return prevComments.filter((comment) => comment.id !== commentId);
            });
        } catch (e) {
            console.error('LINKA-LOG: Error deleting comment', e);
            Alert.alert('Ops...', 'Não foi possível deletar seu comentário. Tente de novo.');
        }
    };

    const confirmDeleteComment = (commentId: string) => {
        setCommentIdToDelete(commentId);
        setConfirmDeleteCommentVisible(true);
    };

    const handleConfirmDeleteComment = () => {
        if (commentIdToDelete) {
            handleDeleteComment(commentIdToDelete);
            setConfirmDeleteCommentVisible(false);
            setCommentIdToDelete(null);
        }
    };

    const convertUserTypeName = (userType: UserType) => {
        if (userType == UserType.VOLUNTEER)
            return 'Voluntário';
        else
            return 'Organização';
    }

    const handleDeletePost = async (postId: string) => {
        try {
            await deletePost(postId);
            props.onChange();
            props.onClose();
        } catch (e) {
            console.error('LINKA-LOG: Error deleting post', e);
            Alert.alert('Ops...', 'Não foi possível deletar seu post. Tente de novo.');
        }
    };

    const handleConfirmDeletePost = () => {
        if (postIdToDelete) {
            handleDeletePost(postIdToDelete);
            setConfirmDeletePostVisible(false);
            setPostIdToDelete(null);
        }
    };

    const confirmDeletePost = (postId: string) => {
        setShowOptions(false);
        setPostIdToDelete(postId);
        setConfirmDeletePostVisible(true);
    };

    const toggleOptions = () => {
        setShowOptions(!showOptions);
    };

    const openProfile = async () => {
        props.onClose();
        const currentUserId = await getOrgVolIdByToken();
        if (props.post.authorId == currentUserId) {
            router.push('/screens/(tabs)/(profile)/profile');
        } else {
            router.push({
                pathname: '/screens/(tabs)/(profile)/profile/[id]',
                params: { id: props.post.authorId, userType: props.post.authorType },
            });
        }
    };

    return (
        <Modal
            visible={props.visible}
            animationType="slide"
            transparent={false}
            onRequestClose={props.onClose}
        >
            <View style={styles.pageColor}>
                <View style={styles.closeButton}>
                    <TouchableOpacity onPress={props.onClose}>
                        <Ionicons name="close" size={30} color={Colors.gray} />
                    </TouchableOpacity>
                </View>
                <View style={styles.container}>
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        <TouchableOpacity onPress={openProfile} style={styles.header}>
                            {props.post.authorImageProfile == null
                                ? <Image source={require('@/assets/images/genericalProfilePhoto.jpg')} style={styles.profileImage} />
                                : <Image source={{ uri: `data:image/png;base64,${props.post.authorImageProfile}` }} style={styles.profileImage} />
                            }
                            <View style={styles.userInfo}>
                                <Text style={styles.userName}>{props.post.authorDisplayName}</Text>
                                <Text style={styles.userType}>{convertUserTypeName(props.post.authorType)}</Text>
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
                                    title='Deletar'
                                    textColor={Colors.red}
                                    iconName='trash-outline'
                                    width={70}
                                    height={20}
                                    borderColor={Colors.white}
                                    backgroundColor={Colors.white}
                                    borderRadius={15}
                                    onPress={() => confirmDeletePost(props.post.id)}
                                />
                            </View>
                        )}

                        {props.post.imageBase64 != undefined && <Image
                            source={{ uri: `data:image/png;base64,${props.post.imageBase64}` }}
                            style={styles.postImage}
                        />}

                        {props.post.associatedOrganizationDisplayName && <Text style={styles.releatedOrg} numberOfLines={1} ellipsizeMode="tail">
                            <Text style={styles.bold}>Relacionado com: </Text>{props.post.associatedOrganizationDisplayName}
                        </Text>}

                        <Text style={styles.postDescription}>{props.post.description}</Text>

                        <View style={styles.footer}>
                            <TouchableOpacity onPress={props.onPressLike} style={styles.iconContainer}>
                                <Ionicons
                                    name="heart"
                                    size={24}
                                    color={props.post.currentUserHasLiked ? Colors.red : Colors.gray}
                                />
                                <Text style={[styles.iconText, { color: props.post.currentUserHasLiked ? Colors.red : Colors.gray }]}>{props.post.likeCount}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.iconContainer}>
                                <Ionicons name="chatbox-ellipses" size={24} color={Colors.gray} />
                                <Text style={styles.iconText}>{props.post.commentCount}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={props.onPressShare} style={styles.iconContainer}>
                                <Ionicons name="repeat" size={24} color={props.post.currentUserHasShared ? Colors.orange : Colors.gray} />
                                <Text style={[styles.iconText, { color: props.post.currentUserHasShared ? Colors.orange : Colors.gray }]}>{props.post.shareCount}</Text>
                            </TouchableOpacity>
                        </View>

                        {comments.map((comment, index) => (
                            <Comment
                                key={index}
                                userName={comment.authorDisplayName}
                                userImageUrl={comment.authorImageProfile != undefined ? comment.authorImageProfile : null}
                                commentText={comment.content}
                                myComment={comment.authorId == userId ? true : false}
                                onPressDelete={() => confirmDeleteComment(comment.id)}
                            />
                        ))}
                    </ScrollView>

                    <View style={styles.commentSection}>
                        {profileImage == null
                            ? <Image source={require('@/assets/images/genericalProfilePhoto.jpg')} style={styles.commentProfileImage} />
                            : <Image source={{ uri: `data:image/png;base64,${profileImage}` }} style={styles.commentProfileImage} />
                        }
                        <TextInput
                            style={styles.commentInput}
                            placeholder="Escreva um comentário..."
                            placeholderTextColor={Colors.gray}
                            value={comentario}
                            onChangeText={setComentario}
                            multiline
                        />
                        <TouchableOpacity style={styles.sendButton} onPress={handleSendComment}>
                            <Ionicons name="arrow-forward" size={20} color={Colors.white} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <Modal
                animationType="fade"
                transparent={true}
                visible={confirmDeletePostVisible}
                onRequestClose={() => setConfirmDeletePostVisible(false)}
            >
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Você realmente deseja deletar seu post?</Text>
                        <Text style={styles.modalText}>Esta ação não pode ser revertida</Text>
                        <View style={styles.modalButtonContainer}>
                            <Button
                                title='Sim'
                                onPress={() => handleConfirmDeletePost()}
                                backgroundColor={Colors.red}
                                textColor={Colors.white}
                                borderColor={Colors.red}
                                borderRadius={15}
                                width={125}
                                height={35}
                            />
                            <Button
                                title='Não'
                                onPress={() => setConfirmDeletePostVisible(false)}
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
                visible={confirmDeleteCommentVisible}
                onRequestClose={() => setConfirmDeleteCommentVisible(false)}
            >
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Você realmente deseja deletar seu comentário?</Text>
                        <Text style={styles.modalText}>Esta ação não pode ser revertida</Text>
                        <View style={styles.modalButtonContainer}>
                            <Button
                                title='Sim'
                                onPress={() => handleConfirmDeleteComment()}
                                backgroundColor={Colors.red}
                                textColor={Colors.white}
                                borderColor={Colors.red}
                                borderRadius={15}
                                width={125}
                                height={35}
                            />
                            <Button
                                title='Não'
                                onPress={() => setConfirmDeleteCommentVisible(false)}
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
        </Modal>
    );
};

const styles = StyleSheet.create({
    pageColor: {
        backgroundColor: Colors.white,
        flex: 1,
    },
    closeButton: {
        width: '100%',
        marginTop: 30,
        marginBottom: 25,
        paddingEnd: 30,
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
    },
    container: {
        flex: 1,
        backgroundColor: Colors.white,
        paddingHorizontal: 20,
    },
    scrollContent: {
        paddingBottom: 80,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
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
        justifyContent: 'center',
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.black,
        marginBottom: 3,
    },
    userType: {
        fontSize: 14,
        color: Colors.gray,
    },
    postImage: {
        width: '100%',
        height: 200,
        marginVertical: 20,
        borderRadius: 10,
    },
    postDescription: {
        fontSize: 14,
        color: Colors.black,
        marginBottom: 20,
        textAlign: 'left',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginBottom: 20,
    },
    iconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 15,
    },
    iconText: {
        fontSize: 14,
        color: Colors.gray,
        marginLeft: 5,
    },
    commentSection: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.lightGray,
        padding: 15,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    commentProfileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    commentInput: {
        flex: 1,
        backgroundColor: Colors.white,
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 10,
        fontSize: 14,
        textAlignVertical: 'center',
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.orange,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    },
    shareIcon: {
        marginLeft: 'auto',
    },
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
    },
    modalContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.white,
        padding: 30,
        borderRadius: 15,
        height: 175,
        width: '85%',
    },
    modalTitle: {
        fontSize: 18,
        marginBottom: 3,
        textAlign: 'center',
        color: Colors.black,
    },
    modalText: {
        fontSize: 14,
        marginBottom: 25,
        textAlign: 'center',
        color: Colors.gray,
    },
    modalButtonContainer: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-around'
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
    releatedOrg: {
        fontSize: 12,
        color: Colors.gray,
        marginTop: 5,
        marginBottom: 10,
    },
    bold: {
        fontWeight: 'bold',
    }
});

export default PostDetailsModal;
