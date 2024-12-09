import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

type IoniconNames = keyof typeof Ionicons.glyphMap;

type Props = {
    title: string,
    onPress: any,
    backgroundColor: string,
    textColor: string,
    borderColor: string,
    borderRadius: number,
    width?: number,
    height?: number,
    padding?: number,
    paddingVertical?: number,
    paddingHorizontal?: number,
    fontSize?: number,
    iconName?: IoniconNames,
    disabled?: boolean,
    justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly', // propriedade opcional
}

export default function Button(props: Props) {
    const isDisabled = props.disabled || false;
    const buttonStyles = [
        styles.button,
        { backgroundColor: isDisabled ? Colors.lightGray : props.backgroundColor },
        { borderRadius: props.borderRadius },
        { width: props.width },
        { height: props.height },
        { padding: props.padding },
        { paddingVertical: props.paddingVertical },
        { paddingHorizontal: props.paddingHorizontal },
        { borderColor: isDisabled ? Colors.mediumGray : props.borderColor },
        props.justifyContent ? { justifyContent: props.justifyContent } : {}, // Aplicar se for passada
    ];

    return (
        <TouchableOpacity
            style={buttonStyles}
            onPress={isDisabled ? undefined : props.onPress}
            disabled={isDisabled}
        >
            {props.iconName && (
                <Ionicons name={props.iconName} size={18} color={isDisabled ? '#a9a9a9' : props.textColor} style={styles.icon} />
            )}
            <Text style={[styles.buttonText, { color: isDisabled ? '#a9a9a9' : props.textColor }, { fontSize: props.fontSize }]}>
                {props.title}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 10,
        height: 40,
        justifyContent: 'center', 
        alignItems: 'center',
        elevation: 5,
        alignSelf: 'center',
        borderWidth: 1,
    },
    icon: {
        marginEnd: 3
    },
    buttonText: {
        fontSize: 16,
    },
});
