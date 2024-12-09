import { Colors } from "@/constants/Colors";
import { Link } from "expo-router"
import { StyleSheet, Text, View } from "react-native"

export default function NotFoundScreen() {
    return (
        <View style={styles.pageColor}>
            <Text style={styles.text}>Ops... Esta página não existe</Text>

            <Link href="/screens/feed" style={styles.link}>Voltar para o Feed</Link>
        </View>
    )
}

const styles = StyleSheet.create({
    pageColor: {
        flex: 1,
        padding: 30,
        backgroundColor: Colors.white,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: 18,
    },
    link: {
        marginTop: 20,
        textDecorationLine: 'underline',
        color: Colors.orange,
    }
});
