import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useRef, useState } from "react";
import {
  Alert, FlatList, Modal, StyleSheet, Text, TextInput,
  TouchableOpacity, View
} from "react-native";
import Layout from "../components/node/layout";

interface Project {
  id: number;
  name: string;
}

export default function Main() {
  const [nickname, setNickname] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    AsyncStorage.getItem('nickname')
      .then(value => setNickname(value))
      .catch(err => console.error("讀取暱稱失敗: ", err))
      .finally(() => setLoading(false));
  }, []);

  // 打開新增專案 Modal
  const handleOpenModal = () => {
    setNewProjectName('');
    setModalVisible(true);
  };

  // 儲存並新增專案
  const handleSaveNewProject = () => {
    if (!newProjectName.trim()) {
      Alert.alert("請輸入專案名稱");
      return;
    }

    const newProject: Project = {
      id: projects.length + 1,
      name: newProjectName.trim(),
    };
    setProjects(prev => [...prev, newProject]);
    setModalVisible(false);

    // 自動滾動到底
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // 清空專案列表
  const handleClearProjects = () => setProjects([]);

  if (loading) {
    return (
      <Layout>
        <Text style={styles.loadingText}>讀取中...</Text>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* 頂部標題 + 按鈕 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.addButton} onPress={handleOpenModal}>
          <Text style={styles.addButtonText}>新增</Text>
        </TouchableOpacity>

        <Text style={styles.title}>專案主頁</Text>

        <TouchableOpacity style={styles.clearButton} onPress={handleClearProjects}>
          <Text style={styles.clearButtonText}>清除</Text>
        </TouchableOpacity>
      </View>

      {/* 專案方格列表 */}
      <FlatList
        ref={flatListRef}
        data={projects}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.projectList}
        renderItem={({ item }) => (
          <View style={styles.projectBox}>
            <View style={styles.displayRow}>
              <Text style={styles.displayLabel}>專案名稱:</Text>
              <Text style={styles.displayName}>{item.name}</Text>
            </View>
          </View>
        )}
      />

      {/* 新增專案 Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>新增專案</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="請輸入專案名稱"
              value={newProjectName}
              onChangeText={setNewProjectName}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={handleSaveNewProject}>
                <Text style={styles.modalButtonText}>儲存</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalButtonText}>取消</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Layout>
  );
}

const styles = StyleSheet.create({
  loadingText: {
    fontSize: 20,
    textAlign: 'center',
    marginTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginVertical: 20,
    height: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  addButton: {
    backgroundColor: '#007AFF',
    width: 80,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  clearButton: {
    backgroundColor: '#FF3B30',
    width: 80,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  projectList: {
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
  projectBox: {
    backgroundColor: '#e6f0ff',
    padding: 20,
    marginBottom: 20,
    borderRadius: 12,
    minHeight: 100,
    justifyContent: 'center',
  },
  projectName: {
    fontSize: 18,
    fontWeight: '600',
  },
  // Modal 樣式
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'stretch',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    backgroundColor: '#28a745',
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  displayRow: {
  flexDirection: 'row',
  alignItems: 'center',
},
displayLabel: {
  fontSize: 16,
  fontWeight: '600',
  marginRight: 2,
  width: 70, // 固定寬度
},
displayName: {
  fontSize: 16,
  fontWeight: '500',
  flex: 1,
},
});
