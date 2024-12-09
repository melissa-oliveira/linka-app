import { Colors } from "@/constants/Colors";
import { UserType } from "@/enums/UserType";
import { router } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
    type: 'Volunteer' | 'Organization' | 'Event' | string;
    displayName: string;
    imageUrl: string | undefined;
    id: string,
    pageFrom: 'feed' | 'search' | 'events';
    openEvent: any;
}

export function SearchCard(props: Props) {

    const handlePress = () => {
        switch (props.type) {
            case "Volunteer":
                router.push({
                    pathname: '/screens/(tabs)/(profile)/profile/[id]',
                    params: { id: props.id, userType: UserType.VOLUNTEER, pageFrom: props.pageFrom },
                });
                break;
            case "Organization":
                router.push({
                    pathname: '/screens/(tabs)/(profile)/profile/[id]',
                    params: { id: props.id, userType: UserType.ORGANIZATION, pageFrom: props.pageFrom },
                });
                break;
            case "Event":
                props.openEvent();
                break;
            default:
                console.warn("Unhandled type: ", props.type);
        }
    };

    const renderType = (type: string) => {
        switch (props.type) {
            case "Volunteer":
                return "Voluntário";
            case "Organization":
                return "Organização";
            case "Event":
                return "Evento";
            default:
                return "";
        }
    }

    return (
        <View style={styles.container}>

            <TouchableOpacity style={styles.pressArea} onPress={() => { handlePress() }}>
                {props.imageUrl == undefined || props.imageUrl == '' ? <Image source={require('@/assets/images/genericalProfilePhoto.jpg')} style={styles.image} />
                    : <Image source={{ uri: `data:image/png;base64,${props.imageUrl}` }} style={styles.image} />}

                <View style={styles.textContainer}>
                    <Text style={styles.username}>{renderType(props.type)}</Text>
                    <Text style={styles.fullname} numberOfLines={1} ellipsizeMode="tail">
                        {props.displayName}
                    </Text>
                </View>
            </TouchableOpacity>
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
        marginBottom: 5,
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