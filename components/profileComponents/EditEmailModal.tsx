import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import Button from "@/components/baseComponets/Button";
import Input from "@/components/baseComponets/Input";

type Props = {
    visible: boolean;
    email: string;
    onSave: (email: any) => void;
    onClose: () => void;
};

export default function EditEmailModal(props: Props) {
    const [email, setEmail] = useState(props.email);

    const [emailError, setEmailError] = useState('');

    useEffect(() => {
        setEmail(props.email);
    }, [props.email]);


    const showErrorMessage = (errorMessage: string, setErrorFunction: (error: string) => void, validateFunction: () => boolean): boolean => {
        if (validateFunction()) {
            setErrorFunction(errorMessage);
            return false;
        } else {
            setErrorFunction('');
            return true;
        }
    };

    const validateFields = () => {
        let isValid = true;

        if (!showErrorMessage('O campo "Sobrenome" é obrigatório.', setEmailError, () => !email)) {
            isValid = false;
        }

        return isValid;
    };

    const handleSave = async () => {
        try {
            if (validateFields()) {
                props.onSave(email);
                Alert.alert('Successo', 'Email editado com sucesso!');
                props.onClose();
            }

        } catch (error) {
            Alert.alert('Erro', 'Opss... Erro ao editar email');
            console.error('Error editing email:', error);
        }

    };

    return (
        <Modal visible={props.visible} animationType="fade" transparent={true} onRequestClose={props.onClose}>
            <View style={styles.modalBackground}>
                <View style={styles.modalContainer}>
                    <View style={styles.closeButton}>
                        <Text style={styles.modalTitle}>Editar Email</Text>
                        <TouchableOpacity onPress={props.onClose}>
                            <Ionicons email="close" size={30} color={Colors.gray} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView contentContainerStyle={styles.scrollContainer}>

                        <View style={styles.inputContainer}>
                            <Input label="Nome" value={email} onChangeText={setEmail} />
                            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
                        </View>

                        <View style={styles.buttonContainer}>
                            <Button
                                title="Salvar"
                                onPress={handleSave}
                                backgroundColor={Colors.orange}
                                textColor={Colors.white}
                                borderColor={Colors.orange}
                                borderRadius={12}
                                height={35}
                                width={200} />
                            <Button
                                title="Cancelar"
                                onPress={props.onClose}
                                backgroundColor={Colors.white}
                                textColor={Colors.red}
                                borderColor={Colors.red}
                                borderRadius={12}
                                height={35}
                                width={200} />
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        width: '90%',
        maxHeight: '80%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        overflow: 'hidden',
    },
    scrollContainer: {
        flexGrow: 1,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginVertical: 10,
    },
    inputContainer: {
        marginBottom: 15,
    },
    buttonContainer: {
        marginTop: 20,
        alignItems: 'center',
        gap: 5,
    },
    buttonWrapper: {
        marginBottom: 10,
    },
    closeButton: {
        width: '100%',
        marginBottom: 20,
        paddingEnd: 10,
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
    },
    divider: {
        borderBottomColor: Colors.mediumGray,
        borderBottomWidth: 1,
        marginTop: 10,
        marginBottom: 30,
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginTop: 5,
    },
});
