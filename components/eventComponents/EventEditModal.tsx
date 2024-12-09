import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import Button from "@/components/baseComponets/Button";
import Input from "@/components/baseComponets/Input";
import ImageInput from "@/components/baseComponets/ImageInput";
import { ViaCEPFind } from "@/services/cep.service";
import { Event } from "@/models/Event";
import { updateEvent } from "@/services/event.service"
import { EventUpdate } from '@/models/viewModels/EventUpdate';
import { validCep } from '@/utils/inputValidation';

type EventEditModalProps = {
    visible: boolean;
    onClose: () => void;
    currentEvent: Event;
};

export default function EventEditModal(props: EventEditModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [imageUri, setImageUri] = useState<string | undefined>(undefined);

    const [cep, setCep] = useState('');
    const [street, setStreet] = useState('');
    const [number, setNumber] = useState('');
    const [state, setState] = useState('');
    const [city, setCity] = useState('');
    const [neighbour, setNeighbour] = useState('');

    const [titleError, setTitleError] = useState('');
    const [descriptionError, setDescriptionError] = useState('');
    const [cepError, setCepError] = useState('');
    const [streetError, setStreetError] = useState('');
    const [numberError, setNumberError] = useState('');
    const [stateError, setStateError] = useState('');
    const [cityError, setCityError] = useState('');
    const [neighbourError, setNeighbourError] = useState('');

    useEffect(() => {
        setTitle(props.currentEvent.title);
        setDescription(props.currentEvent.description);
        setCep(props.currentEvent.address.cep);
        setStreet(props.currentEvent.address.street);
        setNumber(props.currentEvent.address.number.toString());
        setState(props.currentEvent.address.state);
        setCity(props.currentEvent.address.city);
        setNeighbour(props.currentEvent.address.neighborhood);
        setImageUri(props.currentEvent.imageBase64 ? props.currentEvent.imageBase64 : '')
    }, [props.currentEvent]);

    const findCep = async (cep: string) => {
        try {
            setCep(cep)
            if (cep.length === 9) {
                const resultado = await ViaCEPFind(cep.replace(/\D/g, ''));
                setStreet(resultado.logradouro);
                setNeighbour(resultado.bairro);
                setCity(resultado.localidade);
                setState(resultado.estado);
            }
        } catch (error) {
            console.error("Erro ao buscar o CEP:", error);
            Alert.alert("Erro", "Não foi possível buscar o endereço pelo CEP.");
        }
    };

    const handleSave = async () => {
        if (validateFields()) {
            await editEvent();
            props.onClose();
        }
    };

    const handleImageSelect = (base64: string) => {
        setImageUri(base64);
    };

    const handleEditPress = () => {
        setImageUri(undefined);
    };

    const cancelEdit = () => {
        props.onClose();
    };

    const removeMask = (text: string, type: string | null) => {
        if (type === 'phone') {
            return text.replace(/[^\d+]/g, '');
        } else {
            return text.replace(/\D/g, '');
        }
    };

    const editEvent = async () => {
        try {
            const address = {
                nickname: '',
                cep: removeMask(cep, null),
                street: street,
                neighborhood: neighbour,
                state: state,
                city: city,
                number: Number(number),
            };

            const event: EventUpdate = {
                title: title,
                description: description,
                imageBase64: imageUri || null,
                address: address,
            };

            if (props.currentEvent.id) {
                await updateEvent(props.currentEvent.id, event);
                Alert.alert('Successo', 'Evento editado com sucesso!');
                props.onClose();
            }
        } catch (error) {
            Alert.alert('Erro', 'Opss... Erro ao editar evento');
            console.error('Error publishing event:', error);
        }

    };

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

        if (!showErrorMessage('O campo "Título" é obrigatório.', setTitleError, () => !title)) {
            isValid = false;
        }

        if (!showErrorMessage('O campo "Descrição" é obrigatório.', setDescriptionError, () => !description)) {
            isValid = false;
        }

        if (!showErrorMessage('O campo "CEP" é obrigatório.', setCepError, () => !cep)) {
            isValid = false;
        } else if (!showErrorMessage('Digite um CEP válido.', setCepError, () => !validCep(cep))) {
            isValid = false;
        }

        if (!showErrorMessage('O campo "Rua" é obrigatório.', setStreetError, () => !street)) {
            isValid = false;
        }

        if (!showErrorMessage('O campo "Número" é obrigatório.', setNumberError, () => !number)) {
            isValid = false;
        }

        if (!showErrorMessage('O campo "Estado" é obrigatório.', setStateError, () => !state)) {
            isValid = false;
        }

        if (!showErrorMessage('O campo "Cidade" é obrigatório.', setCityError, () => !city)) {
            isValid = false;
        }

        if (!showErrorMessage('O campo "Bairro" é obrigatório.', setNeighbourError, () => !neighbour)) {
            isValid = false;
        }

        return isValid;
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={props.visible}
            onRequestClose={props.onClose}
        >
            <View style={styles.modalBackground}>
                <View style={styles.modalContainer}>
                    <View style={styles.closeButton}>
                        <TouchableOpacity onPress={props.onClose}>
                            <Ionicons name="close" size={30} color={Colors.gray} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView contentContainerStyle={styles.scrollContainer}>
                        <Text style={styles.modalTitle}>Editar Evento</Text>

                        <Text style={styles.label}>Imagem</Text>
                        <ImageInput
                            imageUri={imageUri}
                            onImageSelect={handleImageSelect}
                            onEditPress={handleEditPress}
                            onPress={() => { }}
                            resolutionHeight={450}
                            resolutionWidth={1080}
                            inputHeight={150}
                        />

                        <View style={styles.inputContainer}>
                            <Input
                                label="Título"
                                value={title}
                                onChangeText={setTitle}
                            />
                            {titleError ? <Text style={styles.errorText}>{titleError}</Text> : null}
                        </View>

                        <View style={styles.inputContainer}>
                            <Input
                                label="Descrição"
                                value={description}
                                onChangeText={setDescription}
                            />
                            {descriptionError ? <Text style={styles.errorText}>{descriptionError}</Text> : null}
                        </View>

                        <View style={styles.divider} />
                        <Text style={styles.label}>Endereço</Text>

                        <View style={styles.inputContainer}>
                            <Input
                                label="CEP"
                                value={cep}
                                onChangeText={findCep}
                                keyboardType="numeric"
                                maskType='cep'
                            />
                            {cepError ? <Text style={styles.errorText}>{cepError}</Text> : null}
                        </View>

                        <View style={styles.inputContainer}>
                            <Input
                                label="Rua"
                                value={street}
                                onChangeText={setStreet}
                            />
                            {streetError ? <Text style={styles.errorText}>{streetError}</Text> : null}
                        </View>

                        <View style={styles.inputContainer}>
                            <Input
                                label="Número"
                                value={number}
                                onChangeText={setNumber}
                                keyboardType="numeric"
                            />
                            {numberError ? <Text style={styles.errorText}>{numberError}</Text> : null}
                        </View>

                        <View style={styles.inputContainer}>
                            <Input
                                label="Estado"
                                value={state}
                                onChangeText={setState}
                            />
                            {stateError ? <Text style={styles.errorText}>{stateError}</Text> : null}
                        </View>

                        <View style={styles.inputContainer}>
                            <Input
                                label="Cidade"
                                value={city}
                                onChangeText={setCity}
                            />
                            {cityError ? <Text style={styles.errorText}>{cityError}</Text> : null}
                        </View>

                        <View style={styles.inputContainer}>
                            <Input
                                label="Bairro"
                                value={neighbour}
                                onChangeText={setNeighbour}
                            />
                            {neighbourError ? <Text style={styles.errorText}>{neighbourError}</Text> : null}
                        </View>

                        <View style={styles.buttonContainer}>
                            <View style={styles.buttonWrapper}>
                                <Button
                                    title="Salvar"
                                    onPress={handleSave}
                                    backgroundColor={Colors.orange}
                                    textColor={Colors.white}
                                    borderColor={Colors.orange}
                                    borderRadius={12}
                                    height={40}
                                    width={200}
                                />
                            </View>

                            <View style={styles.buttonWrapper}>
                                <Button
                                    title="Cancelar"
                                    onPress={cancelEdit}
                                    backgroundColor={Colors.white}
                                    textColor={Colors.red}
                                    borderColor={Colors.red}
                                    borderRadius={12}
                                    height={35}
                                    width={200}
                                />
                            </View>
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
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
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
    },
    buttonWrapper: {
        marginBottom: 10,
    },
    closeButton: {
        width: '100%',
        marginBottom: 20,
        paddingEnd: 10,
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
    },
    divider: {
        borderBottomColor: Colors.mediumGray,
        borderBottomWidth: 1,
        marginTop: 10,
        marginBottom: 20,
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginTop: 5,
    },
});
