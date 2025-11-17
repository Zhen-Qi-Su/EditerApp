import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

// 假資料
const mockProjects = [
  { id: "1", name: "後端 API 系統", description: "建立完整 RESTful API", createdAt: "2025-01-01" },
  { id: "2", name: "公司官網", description: "使用 React + Vite 重構", createdAt: "2025-02-12" },
  { id: "3", name: "多人協作筆記", description: "Socket 即時同步", createdAt: "2025-03-08" },
];

// 離線範本
const defaultTemplates = [
  {
    id: "template-1",
    name: "離線範本：單頁任務板",
    description: "範本：包含任務欄位與範例任務，適合離線測試 UI 與互動。",
    createdAt: new Date().toISOString().slice(0, 10),
    tasks: [
      { id: "t1", title: "範例任務 A", done: false },
      { id: "t2", title: "範例任務 B", done: true },
    ],
  },
];

export default function ProjectPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const [project, setProject] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    image: null as string | null,
  });
  const [pendingTasks, setPendingTasks] = useState<any[]>([]);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const loadProject = async () => {
      // 讀取 localProjects
      const rawLocal = await AsyncStorage.getItem("localProjects");
      const localProjects = rawLocal ? JSON.parse(rawLocal) : [];

      // 先找 localProjects
      const localProject = localProjects.find((p: any) => String(p.id) === String(id));
      if (localProject) {
        setProject(localProject);
        setPendingTasks(
          Array.isArray(localProject.tasks)
            ? localProject.tasks.filter((t: any) => t.id?.startsWith("local-"))
            : []
        );
        return;
      }

      // 再找 mockProjects
      const found = mockProjects.find((p) => String(p.id) === String(id));
      if (found) {
        setProject(found);
        return;
      }

      // 最後載入離線範本
      setProject(defaultTemplates[0]);
    };

    loadProject();
  }, [id]);

  if (!project) {
    return (
      <View style={styles.center}>
        <Text style={styles.loading}>載入中...</Text>
      </View>
    );
  }

  const handleAdd = () => {
    setEditingTaskId(null);
    setFormData({ description: "", image: null });
    setShowForm(true);
  };

  const handleSaveTask = async () => {
    if (!formData.description.trim()) {
      Alert.alert("請輸入問題描述");
      return;
    }

    let newTasks = Array.isArray(project.tasks) ? [...project.tasks] : [];

    if (editingTaskId) {
      // 編輯已存在的任務
      newTasks = newTasks.map((t: any) =>
        String(t.id) === String(editingTaskId)
          ? { ...t, description: formData.description, image: formData.image }
          : t
      );
      setEditingTaskId(null);
    } else {
      // 新增任務
      const newTask = {
        id: `local-${Date.now()}`,
        description: formData.description,
        image: formData.image,
        done: false,
      };
      newTasks = [newTask, ...newTasks];
      setPendingTasks([newTask, ...pendingTasks]);
    }

    const updatedProject = { ...project, tasks: newTasks };
    setProject(updatedProject);

    // 儲存到 localProjects
    try {
      const rawLocal = await AsyncStorage.getItem("localProjects");
      const localProjects = rawLocal ? JSON.parse(rawLocal) : [];
      const existingIndex = localProjects.findIndex((p: any) => String(p.id) === String(updatedProject.id));
      if (existingIndex >= 0) {
        localProjects[existingIndex] = updatedProject;
      } else {
        localProjects.unshift(updatedProject);
      }
      await AsyncStorage.setItem("localProjects", JSON.stringify(localProjects));
    } catch (error) {
      console.error("Persist localProjects failed", error);
      Alert.alert("錯誤", "無法保存項目");
    }

    setFormData({ description: "", image: null });
    setShowForm(false);
    Alert.alert("成功", editingTaskId ? "項目已更新" : "項目已新增");
  };

  const handleUploadImage = () => {
    Alert.alert("提示", "圖片上傳功能開發中...");
  };

  const handleEditPending = (taskId: string) => {
    const task =
      pendingTasks.find((t) => String(t.id) === String(taskId)) ||
      (project?.tasks || []).find((t: any) => String(t.id) === String(taskId));
    if (!task) return;
    setEditingTaskId(String(task.id));
    setFormData({ description: task.description ?? "", image: task.image ?? null });
    setShowForm(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            router.push("/page/main");
          }}
        >
          <Text style={styles.backBtnText}>返回</Text>
        </TouchableOpacity>

        <Text style={styles.title}>項目</Text>
      </View>

      <View style={styles.contentContainer}>
        {/* 新增表單 */}
        {showForm && (
          <View style={styles.formSection}>
            <Text style={styles.formTitle}>新增項目</Text>
            <View style={styles.formGrid}>
              <View style={[styles.gridItem, styles.gridItemLeft]}>
                <Text style={styles.gridLabel}>問題描述</Text>
              </View>
              <View style={[styles.gridItem, styles.gridItemRight]}>
                <TextInput
                  style={styles.gridInput}
                  placeholder="輸入問題描述..."
                  placeholderTextColor="#ccc"
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  multiline
                />
              </View>
              <View style={[styles.gridItem, styles.gridItemLeftBottom]}>
                <Text style={styles.gridLabel}>圖片</Text>
              </View>
              <View style={[styles.gridItem, styles.gridItemRightBottom]}>
                {formData.image ? (
                  <View style={styles.imagePreview}>
                    <Text style={styles.imagePreviewText}>✓ 已選擇圖片</Text>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.uploadButton} onPress={handleUploadImage}>
                    <Text style={styles.uploadButtonText}>點擊上傳圖片</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
            <View style={styles.formButtonGroup}>
              <TouchableOpacity style={[styles.formBtn, styles.saveBtn]} onPress={handleSaveTask}>
                <Text style={styles.formBtnText}>保存</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.formBtn, styles.cancelBtn]}
                onPress={() => {
                  setFormData({ description: "", image: null });
                  setShowForm(false);
                }}
              >
                <Text style={styles.formBtnText}>取消</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* 暫存列表 */}
        {!showForm && pendingTasks.length > 0 && (
          <View style={styles.pendingList}>
            {pendingTasks.map((t) => (
              <TouchableOpacity key={t.id} style={styles.pendingItem} onPress={() => handleEditPending(t.id)}>
                <Text style={styles.pendingText} numberOfLines={2}>
                  {t.description || "新項目"}
                </Text>
                <Text style={styles.pendingBadge}>等待同步</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* 新增按鈕 */}
        <TouchableOpacity style={styles.bigButton} onPress={handleAdd} activeOpacity={0.8}>
          <Text style={styles.bigButtonText}>新增項目</Text>
          <Text style={styles.plusSymbol}>＋</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
    backgroundColor: "#f0f4ff",
  },
  headerSection: {
    marginBottom: 20,
  },
  backBtn: {
    marginBottom: 15,
    width: 80,
    paddingVertical: 8,
  },
  backBtnText: {
    fontSize: 18,
    color: "#3b6ae3",
  },
  title: {
    fontSize: 50,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#1a1a1a",
    textAlign: "center",
    width: "100%",
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "#aac5e4ff",
    borderRadius: 16,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 40,
    width: "105%",
    alignSelf: "center",
  },
  center: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 40,
  },
  loading: {
    fontSize: 22,
    color: "#555",
  },
  bigButton: {
    width: 320,
    height: 160,
    borderRadius: 16,
    backgroundColor: "#3b6ae3",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  bigButtonText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
  },
  plusSymbol: {
    color: "#fff",
    fontSize: 60,
    lineHeight: 56,
    fontWeight: "700",
  },
  infoBox: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 30,
  },
  infoLabel: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
  },
  infoText: {
    fontSize: 18,
    marginTop: 5,
    color: "#333",
  },
  taskBtn: {
    backgroundColor: "#3b6ae3",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  taskBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
    color: "#1a1a1a",
  },
  //新增項目容器
  formSection: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    maxWidth: 400,
    alignSelf: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 15,
    textAlign: "left",
    color: "#1a1a1a",
  },
  formGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
    // 使用左右兩欄配置（左窄 30%，右寬 68%）
    justifyContent: "space-between",
  },
  gridItem: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 12,
    justifyContent: "center",
  },
  // 左側標籤格（窄欄）
  gridItemLeft: {
    width: "30%",
    minHeight: 120,
    backgroundColor: "#f0f4f8",
    alignItems: "flex-start",
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#e0e6ef",
  },
  // 右側輸入/上傳格（寬欄）
  gridItemRight: {
    width: "68%",
    minHeight: 140,
    alignItems: "stretch",
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#e0e6ef",
  },
  // 底部左格（圖片標籤）專用高度
  gridItemLeftBottom: {
    width: "30%",
    minHeight: 100,        // ← 調整這裡控制左下行高
    backgroundColor: "#f0f4f8",
    alignItems: "flex-start",
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#e0e6ef",
  },
  // 底部右格（圖片上傳）專用高度
  gridItemRightBottom: {
    width: "68%",
    minHeight: 100,        // ← 調整這裡控制右下行高
    alignItems: "stretch",
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#e0e6ef",
  },
  gridLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  gridInput: {
    fontSize: 16,
    color: "#333",
    padding: 0,
    minHeight: 100,        // 文字輸入區高度
    textAlignVertical: "top",
  },
  uploadButton: {
    backgroundColor: "#3b6ae3",
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  imagePreview: {
    backgroundColor: "#d4edda",
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  imagePreviewText: {
    color: "#155724",
    fontSize: 16,
    fontWeight: "600",
  },
  formButtonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  formBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelBtn: {
    backgroundColor: "#8e8e8eff",
  },
  saveBtn: {
    backgroundColor: "#3b6ae3",
  },
  formBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  // 暫存項目樣式
  pendingList: {
    width: "100%",
    marginBottom: 12,
  },
  pendingItem: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e6eefc",
  },
  pendingText: {
    color: "#333",
    flex: 1,
    marginRight: 10,
  },
  pendingBadge: {
    backgroundColor: "#f0ad4e",
    color: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: "700",
  },
});
