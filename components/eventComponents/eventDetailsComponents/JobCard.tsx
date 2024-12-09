import Button from "@/components/baseComponets/Button";
import { Colors } from "@/constants/Colors";
import { EventStatus } from "@/enums/EventStatus";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
    buttonType: 'volunteer' | 'subscribedVolunteer' | 'subscribedVolunteerOtherJob' | 'organization'
    eventStatus: EventStatus;
    jobTitle: string,
    jobsDetails: string,
    filledJobs: string,
    totalJobs: string,
    onPress: any,
    onPressTicket?: any,
}

export default function JobCardComponent(props: Props) {
    return (
        <>
            {props.buttonType === 'subscribedVolunteer' ? (
                <View style={styles.subscribedCard}>
                    <View style={styles.cardLeftContent}>
                        <Text style={styles.subscribedJobTitle}>{props.jobTitle}</Text>
                        <View style={styles.jobsDetails}>
                            <Text numberOfLines={2} ellipsizeMode="tail" style={styles.subscribedJobsDetailsText}>
                                {props.jobsDetails}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.subscribedCardRightContent}>
                        <View style={styles.subscribedContainer}>
                            <Text style={styles.subscribedText}>Inscrito</Text>
                            <Ionicons name="checkmark-circle-outline" size={20} color={Colors.orange} />
                        </View>
                        <TouchableOpacity onPress={props.onPressTicket}><Text style={styles.ticketText}>Acessar inscrição</Text></TouchableOpacity>
                    </View>
                </View>
            ) : (
                <View style={styles.card}>
                    <View style={styles.cardLeftContent}>
                        <Text style={styles.jobTitle}>{props.jobTitle}</Text>
                        <View style={styles.jobsDetails}>
                            <Text numberOfLines={2} ellipsizeMode="tail" style={styles.jobsDetailsText}>
                                {props.jobsDetails}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.cardRightContent}>
                        <View style={styles.jobsQnt}>
                            <Ionicons name="people-outline" size={16} color={Colors.gray} />
                            <Text style={styles.jobsText}>{props.filledJobs} / {props.totalJobs}</Text>
                        </View>
                        {props.buttonType == 'volunteer' && props.eventStatus == EventStatus.OPEN && props.filledJobs < props.totalJobs &&
                            <Button
                                title={"Inscrever-se"}
                                onPress={props.onPress}
                                backgroundColor={Colors.white}
                                textColor={Colors.orange}
                                borderColor={Colors.orange}
                                borderRadius={20}
                                fontSize={12}
                                paddingHorizontal={10}
                                height={30}
                            />}

                        {props.buttonType == 'organization' &&
                            <Button
                                title={"Ver inscritos"}
                                onPress={props.onPress}
                                backgroundColor={Colors.white}
                                textColor={Colors.orange}
                                borderColor={Colors.orange}
                                borderRadius={20}
                                fontSize={12}
                                paddingHorizontal={10}
                                height={30}
                            />}
                    </View>
                </View>
            )}
        </>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 18,
        marginBottom: 10,
        backgroundColor: Colors.lightGray,
        borderRadius: 8,
    },
    cardLeftContent: {
        flex: 1,
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingEnd: 15,
    },
    cardRightContent: {
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: 10,
    },
    jobTitle: {
        fontSize: 14,
        marginBottom: 7,
        fontWeight: '600'
    },
    jobsDetails: {

    },
    jobsDetailsText: {
        fontSize: 12,
        color: Colors.black,
    },
    jobsQnt: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 7,
    },
    jobsText: {
        marginLeft: 4,
        fontSize: 14,
        color: Colors.gray,
    },
    button: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#FFA500',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 5,
    },
    buttonText: {
        color: '#FFA500',
        fontWeight: 'bold',
    },
    subscribedContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end'
    },
    subscribedText: {
        color: Colors.orange,
        fontSize: 16,
        marginEnd: 2,
    },
    subscribedCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 18,
        marginBottom: 10,
        backgroundColor: Colors.white,
        borderColor: Colors.orange,
        borderWidth: 1,
        borderRadius: 8,
    },
    subscribedCardRightContent: {
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: 4,
    },
    subscribedJobTitle: {
        fontSize: 14,
        marginBottom: 7,
        fontWeight: '600',
        color: Colors.orange
    },
    subscribedJobsDetailsText: {
        fontSize: 12,
        color: Colors.orange,
    },
    unsubscribeText: {
        fontSize: 12,
        color: Colors.red,
        textDecorationLine: 'underline'
    },
    ticketText: {
        fontSize: 12,
        color: Colors.gray,
        textDecorationLine: 'underline'
    },
});