import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity } from "react-native";
import Layout from '../components/node/layout';


export default function Login() {
    const [inputText, setInputText] = useState('');
    const router = useRouter();

    const handleInputText = (text: string) => {
        setInputText(text);
    };

    const handleEnter = async () => {
        if (!inputText.trim()) {
            Alert.alert('請輸入名字');
            return;
        }

        try {
            await AsyncStorage.setItem('nickname', inputText);
            router.replace('/page/main');
        } catch (e) {
            console.log('Failed to save nickname', e);
        }
    };

    return (
        <Layout>
            <Text style={styles.fieldName}>請輸入你的名字</Text>
            <TextInput
                value={inputText}
                style={styles.fieldValue}
                placeholder='請輸入名字'
                onChangeText={handleInputText}
                onSubmitEditing={handleEnter}
                returnKeyType="done"
            />
            <TouchableOpacity style={styles.button} onPress={handleEnter}>
                <Text style={styles.buttonText}>進入</Text>
            </TouchableOpacity>
        </Layout>
    );
}

const styles = StyleSheet.create({
    screen: {
        margin: 5,
        padding: 5,
        paddingTop: 15,
    },
    fieldName: {
        marginTop: 50,
        marginBottom: 30,
        padding: 0,
        fontSize: 25,       // 調整文字大小，單位是 px
        textAlign: 'center' // 文字置中
    },
    fieldValue: {
        height: 50,            // 框框高度
        borderWidth: 2,
        borderColor: '#121212ff',
        paddingHorizontal: 10, // 左右內距
        paddingVertical: 10,   // 上下內距
        marginVertical: 10,
        marginHorizontal: 50,
        fontSize: 18,          // placeholder + 輸入文字大小
        textAlign: 'left'    // 文字置中
     },
    // ===== 新增按鈕樣式 =====
    button: {
        backgroundColor: '#007AFF',  // 背景色
        paddingVertical: 12,         // 上下內距
        paddingHorizontal: 30,       // 左右內距
        borderRadius: 8,             // 圓角
        marginTop: 30,               // 與上方元素距離
        alignItems: 'center',        // 文字置中
        marginHorizontal: 50,
    },
    buttonText: {
        color: 'white',              // 文字顏色
        fontSize: 16,                // 文字大小
        fontWeight: 'bold',          // 粗體
    }
});
