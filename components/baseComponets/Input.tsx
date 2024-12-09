import { Colors } from '@/constants/Colors';
import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { TextInputMask } from 'react-native-masked-text';

type KeyboardTypeOptions = 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'number-pad' | 'decimal-pad' | 'visible-password' | 'ascii-capable' | 'numbers-and-punctuation' | 'url' | 'name-phone-pad' | 'twitter' | 'web-search';

type Props = {
    label?: string;
    value: string;
    onChangeText: (text: string) => void;
    secureTextEntry?: boolean;
    keyboardType?: KeyboardTypeOptions;
    isNumeric?: boolean;
    maskType?: 'cpf' | 'cnpj' | 'phone' | 'cep';
    width?: number,
}

export default function Input(props: Props) {
    const handleChangeText = (text: string) => {
        if (props.isNumeric) {
            const numericText = text.replace(/[^0-9]/g, '');
            props.onChangeText(numericText);
        } else {
            props.onChangeText(text);
        }
    };

    return (
        <View style={[styles.container, props.width ? { width: props.width } : {}]}>
            {props.label && <Text style={styles.label}>{props.label}</Text>}
            <View style={styles.inputContainer}>
                {props.maskType ? (
                    <TextInputMask
                        type={
                            props.maskType === 'cpf' ? 'cpf' :
                                props.maskType === 'cnpj' ? 'cnpj' :
                                    props.maskType === 'cep' ? 'zip-code' : 'custom'
                        }
                        options={
                            props.maskType === 'phone'
                                ? { mask: '+55 99 99999-9999' }
                                : undefined
                        }
                        value={props.value}
                        onChangeText={handleChangeText}
                        style={styles.input}
                        keyboardType={props.keyboardType}
                    />
                ) : (
                    <TextInput
                        value={props.value}
                        onChangeText={handleChangeText}
                        secureTextEntry={props.secureTextEntry}
                        keyboardType={props.keyboardType}
                        style={styles.input}
                        underlineColorAndroid="transparent"
                    />
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    label: {
        marginBottom: 3,
        fontSize: 16,
        color: Colors.black,
    },
    inputContainer: {
        borderRadius: 5,
    },
    input: {
        height: 40,
        fontSize: 16,
        borderRadius: 10,
        backgroundColor: Colors.lightGray,
        borderWidth: 1,
        borderColor: Colors.mediumGray,
        padding: 8,
    },
});