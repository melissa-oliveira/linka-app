
import { useAuth } from "@/context/AuthProvider";
import { Redirect } from "expo-router";
import React, { useEffect, useState } from "react";
import { View, Image, StyleSheet } from "react-native";
import { Colors } from "react-native/Libraries/NewAppScreen";

export default function indexScreen() {
    const [redirect, setRedirect] = useState(false);
    const { authState } = useAuth();

    useEffect(() => {
        const timer = setTimeout(() => {
            setRedirect(true);
        }, 2500);

        return () => clearTimeout(timer);
    }, []);

    if (redirect) {
        return authState?.token ? (
            <Redirect href="/screens/(tabs)/(feed)/feed" />
        ) : (
            <Redirect href="/screens/(auth)/(login)/login" />
        );
    }
    return (
        <View style={styles.container}>
            <Image
                source={require('../assets/images/animated-orange-logo.gif')}
                style={styles.gif}
            />
        </View>
    );
}
const styles = StyleSheet.create({
    gif: {
        width: 300,
        height: 130,
    },
    container: {
        backgroundColor: Colors.white,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});