import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { formatDateTime } from "@/utils/formatDateTime"
import { TouchableOpacity, ImageBackground, StyleSheet, Text, View } from "react-native";
import { EventStatus } from "@/enums/EventStatus";

type Props = {
    eventTitle: string,
    eventStartDateTime: string,
    eventImageUrl: string,
    onPress: any,
    eventStatus: EventStatus,
};

export default function EventSquareCard(props: Props) {

    const isCanceled = props.eventStatus === EventStatus.CANCELED;

    return (
        <TouchableOpacity
            style={[styles.card, isCanceled && styles.cardDisabled]}
            onPress={isCanceled ? null : props.onPress}
            disabled={isCanceled}
        >
            <ImageBackground source={{ uri: `data:image/png;base64,${props.eventImageUrl}` }} style={styles.image}>
                <View style={styles.overlay}>
                    <View style={styles.content}>
                        <Text style={styles.date}>
                            <Ionicons name="calendar-clear-outline" size={12} color={Colors.white} /> {formatDateTime(props.eventStartDateTime)}
                        </Text>
                        <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
                            {props.eventTitle}
                        </Text>
                        {isCanceled
                            ? <View style={styles.iconRow}>
                                <Ionicons name="alert-circle-outline" size={18} color={Colors.white} style={styles.icons} />
                                <Text style={styles.canceledText}>Cancelado</Text>
                            </View>
                            : null
                        }
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
    cardDisabled: {
        opacity: 0.7,
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
    canceledText: {
        color: Colors.white,
        fontWeight: 'bold',
        fontSize: 16,
    },
    icons: {
        padding: 0,
        margin: 0,
    },
    iconRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        marginTop: 50
    },
});
