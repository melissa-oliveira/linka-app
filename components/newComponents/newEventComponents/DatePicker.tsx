import React, { useEffect, useState } from 'react';
import { SafeAreaView, Text, TextInput, StyleSheet, TouchableOpacity, View, Modal, Platform, TouchableWithoutFeedback, Button } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { formatDate } from '@/utils/formatDateTime';

type Props = {
    label: string;
    value: Date;
    onChange: any;
    minimumDate?: Date;
};

export default function DatePicker(props: Props) {
    const [date, setDate] = useState<Date>(props.value);
    const [showDate, setShowDate] = useState(false);

    useEffect(() => {
        setDate(props.value);
    }, [props.value]);

    const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
        if (Platform.OS !== 'ios') {
            setShowDate(false);
        }

        const currentDate = selectedDate || date;
        setDate(currentDate);
        if (props.onChange) {
            props.onChange(currentDate);
        }
    };

    return (
        <SafeAreaView>
            <TouchableOpacity onPress={() => setShowDate(true)}>
                <Text style={styles.label}>{props.label}</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        value={formatDate(date.toString())}
                        style={styles.input}
                        editable={false}
                        pointerEvents="none"
                    />
                    <Ionicons name="calendar-outline" size={24} style={styles.icon} />
                </View>
            </TouchableOpacity>

            {showDate && Platform.OS === 'ios' && (
                <Modal transparent={true} animationType="fade">
                    <TouchableWithoutFeedback onPress={() => setShowDate(false)}>
                        <View style={styles.modalOverlay}>
                            <TouchableWithoutFeedback onPress={() => { }}>
                                <View style={styles.modalContainer}>
                                    <DateTimePicker
                                        testID="dateTimePicker"
                                        value={date}
                                        mode="date"
                                        display="spinner"
                                        onChange={onChangeDate}
                                        style={styles.modalInput}
                                        minimumDate={props.minimumDate}
                                    />
                                    <Button title="OK" onPress={() => setShowDate(false)} color={Colors.white} />
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>
            )}

            {showDate && Platform.OS !== 'ios' && (
                <DateTimePicker
                    testID="dateTimePicker"
                    value={date}
                    mode="date"
                    display="spinner"
                    onChange={onChangeDate}
                    style={styles.modalInput}
                    minimumDate={props.minimumDate}
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
    modalInput: {
        backgroundColor: Colors.gray,
    },
});
