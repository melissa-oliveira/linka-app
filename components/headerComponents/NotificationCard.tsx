import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { UserType } from '@/enums/UserType';

type Props = {
    userImageProfile: string,
    userFullName: string,
    username: string,
    userId: string,
    onPressReject: any,
    onPressAcept: any,
};

export default function NotificationCard(props: Props) {
    return (
        <View style={styles.container}>

            <TouchableOpacity style={styles.pressArea} onPress={() => {
                router.push({
                    pathname: '/screens/(tabs)/(profile)/profile/[id]',
                    params: { id: props.userId, userType: UserType.VOLUNTEER },
                });
            }}>
                {props.userImageProfile == undefined || props.userImageProfile == '' ? <Image source={require('@/assets/images/genericalProfilePhoto.jpg')} style={styles.image} />
                    : <Image source={{ uri: `data:image/png;base64,${props.userImageProfile}` }} style={styles.image} />}

                <View style={styles.textContainer}>
                    <Text style={styles.fullname} numberOfLines={1} ellipsizeMode="tail">
                        {props.userFullName}
                    </Text>
                    <Text style={styles.username}>@{props.username}</Text>
                </View>
            </TouchableOpacity>

            <View style={styles.buttonContainer} >
                <TouchableOpacity onPress={() => props.onPressAcept()}>
                    <Ionicons name="checkmark-outline" size={28} color={Colors.green} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => props.onPressReject()}>
                    <Ionicons name="close-outline" size={28} color={Colors.red} />
                </TouchableOpacity>
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
        backgroundColor: Colors.white,
        borderRadius: 10,
        borderColor: Colors.mediumGray,
        borderWidth: 1,
        paddingVertical: 12,
        paddingHorizontal: 12,
    },
    image: {
        width: 60,
        height: 60,
        borderRadius: 100,
        marginRight: 10,
    },
    textContainer: {
        flex: 1,
    },
    fullname: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.black,
    },
    username: {
        fontSize: 14,
        color: Colors.gray,
        marginTop: 5,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 10,
    },
    pressArea: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '77%'
    }
});
