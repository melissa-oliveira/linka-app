import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';

type Props = {
    title: string,
    onPress: any,
    backgroundColor: string,
    textColor: string,
    borderColor: string,
    width?: number,
    height?: number,
    fontSize?: number,
    iconName?: any,
}

export default function OptionModalNew(props: Props) {
    return (
        <TouchableOpacity style={[styles.button,
        { backgroundColor: props.backgroundColor },
        { width: props.width },
        { height: props.height },
        { borderColor: props.borderColor }]} onPress={props.onPress}>
            <View style={[styles.iconContainer, { backgroundColor: props.textColor }]}>
                <Ionicons name={props.iconName} size={18} color={props.backgroundColor} />
            </View>
            <Text style={[styles.buttonText, { color: props.textColor }, { fontSize: props.fontSize }]}>{props.title}</Text>
        </TouchableOpacity >
    );
};

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        padding: 10,
        height: 40,
        justifyContent: 'flex-start',
        alignItems: 'center',
        elevation: 5,
        alignSelf: 'center',
        borderWidth: 1,
        borderRadius: 40,
    },
    iconContainer: {
        marginEnd: 10,
        padding: 7,
        borderRadius: 100,
    },
    buttonText: {
        fontSize: 16,
    },
});