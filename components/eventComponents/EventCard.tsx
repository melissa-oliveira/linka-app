import { Colors } from "@/constants/Colors"
import { EventStatus } from "@/enums/EventStatus"
import { formatDateTime } from "@/utils/formatDateTime"
import { Ionicons } from "@expo/vector-icons"
import { TouchableOpacity, ImageBackground, StyleSheet, Text, View } from "react-native"

type Props = {
    eventTitle: string,
    eventStartDateTime: string,
    eventEndDateTime: string,
    eventJobs: string,
    eventFilledJobs: string,
    eventImageUrl: string,
    eventStatus: EventStatus,
    onPress: any,
}

export default function EventCard(props: Props) {

    const isCanceled = props.eventStatus === EventStatus.CANCELED;

    return (
        <TouchableOpacity
            style={[styles.card, isCanceled && styles.cardDisabled]}
            onPress={isCanceled ? null : props.onPress}
            disabled={isCanceled}
        >
            <ImageBackground
                source={{ uri: `data:image/png;base64,${props.eventImageUrl}` }}
                style={styles.image}
            >
                <View style={styles.overlay}>
                    <View style={styles.content}>
                        <View style={styles.iconRow}>
                            <Ionicons name="calendar-clear-outline" size={12} color={Colors.white} style={styles.icons} />
                            <Text style={styles.date}>
                                {formatDateTime(props.eventStartDateTime)} - {formatDateTime(props.eventEndDateTime)}
                            </Text>
                        </View>
                        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">{props.eventTitle}</Text>
                        {isCanceled
                            ? <View style={styles.iconRow}>
                                <Ionicons name="alert-circle-outline" size={18} color={Colors.white} style={styles.icons} />
                                <Text style={styles.canceledText}>Evento Cancelado</Text>
                            </View>
                            : <View style={styles.iconRow}>
                                <Ionicons name="person-outline" size={14} color={Colors.white} style={styles.icons} />
                                <Text style={styles.jobs}>{props.eventFilledJobs} / {props.eventJobs}</Text>
                            </View>
                        }
                    </View>
                </View>
            </ImageBackground>
        </TouchableOpacity >
    )
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.black,
        borderRadius: 15,
        overflow: 'hidden',
        marginBottom: 15,
    },
    cardDisabled: {
        opacity: 0.7,
    },
    image: {
        width: '100%',
        height: 110,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
    },
    content: {
        padding: 20,
    },
    date: {
        color: Colors.white,
        fontSize: 12,
    },
    title: {
        color: Colors.white,
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 5,
        marginBottom: 20,
    },
    jobs: {
        color: Colors.white,
        fontSize: 14,
    },
    icons: {
        padding: 0,
        margin: 0,
    },
    canceledText: {
        color: Colors.white,
        fontWeight: 'bold',
        fontSize: 16,
    },
    iconRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
})
