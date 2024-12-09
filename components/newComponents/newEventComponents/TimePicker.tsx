import React, { useEffect, useState } from 'react';
import { SafeAreaView, Text, TextInput, StyleSheet, TouchableOpacity, View, Platform, Modal, TouchableWithoutFeedback, Button } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { formatTime } from '@/utils/formatDateTime';

type Props = {
    label: string;
    value: Date;
    onChange: any;
    minimumTime?: Date;
};

export default function TimePicker(props: Props) {
    const [time, setTime] = useState<Date>(props.value);
    const [showTime, setShowTime] = useState(false);

    useEffect(() => {
        setTime(props.value);
    }, [props.value]);


    const onChangeTime = (event: DateTimePickerEvent, selectedTime?: Date) => {
        if (Platform.OS !== 'ios') {
            setShowTime(false);
        }

        console.log(selectedTime)
        const currentTime = selectedTime || time;
        setTime(currentTime);
        if (props.onChange) {
            props.onChange(currentTime);
            console.log(currentTime)
        }
    };

    return (
        <SafeAreaView>
            <TouchableOpacity onPress={() => setShowTime(true)}>
                <Text style={styles.label}>{props.label}</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        value={formatTime(time.toString())}
                        style={styles.input}
                        editable={false}
                        pointerEvents="none"
                    />
                    <Ionicons name="time-outline" size={24} style={styles.icon} />
                </View>
            </TouchableOpacity>

            {showTime && Platform.OS === 'ios' && (
                <Modal transparent={true} animationType="fade">
                    <TouchableWithoutFeedback onPress={() => setShowTime(false)}>
                        <View style={styles.modalOverlay}>
                            <TouchableWithoutFeedback onPress={() => { }}>
                                <View style={styles.modalContainer}>
                                    <DateTimePicker
                                        testID="timePicker"
                                        value={time}
                                        mode="time"
                                        display="spinner"
                                        onChange={onChangeTime}
                                        style={styles.modalInput}
                                        minimumDate={props.minimumTime}
                                    />
                                    <Button title="OK" onPress={() => setShowTime(false)} color={Colors.white} />
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>
            )}

            {showTime && Platform.OS !== 'ios' && (
                <DateTimePicker
                    testID="timePicker"
                    value={time}
                    mode="time"
                    display="spinner"
                    onChange={onChangeTime}
                    style={styles.modalInput}
                    minimumDate={props.minimumTime}
                />
            )}

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    input: {
        height: 40,
        fontSize: 16,
        borderRadius: 10,
        backgroundColor: Colors.lightGray,
        color: Colors.black,
        borderWidth: 1,
        borderColor: Colors.mediumGray,
        padding: 8,
        paddingLeft: 40,
    },
    label: {
        marginBottom: 3,
        fontSize: 16,
        color: Colors.black,
    },
    inputContainer: {
        position: 'relative',
        borderRadius: 10,
        backgroundColor: Colors.lightGray,
        borderColor: Colors.mediumGray,
    },
    icon: {
        position: 'absolute',
        left: 10,
        top: 8,
        color: Colors.gray,
    },
    modalInput: {
        width: 250,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    modalContainer: {
        backgroundColor: Colors.gray,
        padding: 5,
        borderRadius: 10,
        elevation: 5,
    },
});
