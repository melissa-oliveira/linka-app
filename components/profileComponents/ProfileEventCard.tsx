import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { formatDateTime } from "@/utils/formatDateTime"
import { TouchableOpacity, ImageBackground, StyleSheet, Text, View } from "react-native";

type Props = {
    eventTitle: string,
    eventStartDateTime: string,
    eventImageUrl: string,
    onPress: any,
};

export default function ProfileEventCard(props: Props) {
    return (
        <TouchableOpacity style={styles.card} onPress={props.onPress}>
            <ImageBackground source={{ uri: `data:image/png;base64,${props.eventImageUrl}` }} style={styles.image}>
                <View style={styles.overlay}>
                    <View style={styles.content}>
                        <Text style={styles.date}>
                            <Ionicons name="calendar-clear-outline" size={12} color={Colors.white} /> {formatDateTime(props.eventStartDateTime)}
                        </Text>
                        <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
                            {props.eventTitle}
                        </Text>
                    </View>
                </View>
            </ImageBackground>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 15,
        overflow: 'hidden',
        marginBottom: 15,
        width: 150, 
        height: 150,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    content: {
        padding: 10,
        justifyContent: 'center',
    },
    date: {
        color: Colors.white,
        fontSize: 13,
        marginBottom: 5,
        marginTop: 3
    },
    title: {
        color: Colors.white,
        fontSize: 14,
        textAlign: 'left',
        fontWeight: 'bold',
        marginTop: 7
    },
});
