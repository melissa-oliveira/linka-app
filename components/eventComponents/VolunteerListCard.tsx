import { Colors } from "@/constants/Colors"
import { VolunteerSubscribed } from "@/models/viewModels/VolunteerSubscribed"
import { Ionicons } from "@expo/vector-icons"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"

type Props = {
    volunteerInfo: VolunteerSubscribed,
    onPressVolunteerTicket: any
}

export const VolunteerListCard = (props: Props) => {
    return (
        <View style={styles.volunteerContainer}>
            <View style={styles.volunteerRow}>
                <View>
                    <Text style={styles.volunteerName}>{props.volunteerInfo.fullName}</Text>
                    <TouchableOpacity onPress={props.onPressVolunteerTicket}>
                        <Text style={styles.link}>Ver inscrição</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.statusContainer}>
                    <View style={styles.checkContainer}>
                        <Text style={[styles.checkText, { color: props.volunteerInfo.checkIn ? Colors.green : Colors.red }]}>Check-in</Text>
                        <Ionicons
                            name={props.volunteerInfo.checkIn ? "checkmark-circle-outline" : "close-circle-outline"}
                            size={20}
                            color={props.volunteerInfo.checkIn ? Colors.green : Colors.red}
                            style={styles.icon}
                        />
                    </View>
                    <View style={styles.checkContainer}>
                        <Text style={[styles.checkText, { color: props.volunteerInfo.checkOut ? Colors.green : Colors.red }]}>Check-out</Text>
                        <Ionicons
                            name={props.volunteerInfo.checkOut ? "checkmark-circle-outline" : "close-circle-outline"}
                            size={20}
                            color={props.volunteerInfo.checkOut ? Colors.green : Colors.red}
                            style={styles.icon}
                        />
                    </View>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    pageColor: {
        backgroundColor: Colors.white,
        flex: 1,
    },
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    volunteerContainer: {
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    volunteerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    volunteerName: {
        fontSize: 18,
        fontWeight: '500',
        flex: 1,
    },
    statusContainer: {
        alignItems: 'flex-end',
    },
    checkContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkText: {
        fontSize: 14,
        marginRight: 4,
    },
    icon: {
        marginRight: 8,
    },
    link: {
        color: Colors.gray,
        textDecorationLine: 'underline',
        marginTop: 8,
    },
    separator: {
        height: 1,
        backgroundColor: '#ccc',
        marginVertical: 8,
    },
});

