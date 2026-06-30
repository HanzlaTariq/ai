import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

type Message = {
  id: string;
  role: "user" | "ai";
  text: string;
};

// 👇 Apna local IP yahan daalo (jo "npx expo start" chalane par dikha tha)
// Real phone pe test kar rahe ho: "http://192.168.100.137:5000"
// Android Emulator pe test kar rahe ho: "http://10.0.2.2:5000"
const API_URL = "https://aibackend-production-da9b.up.railway.app";
export default function ChatScreen() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "ai",
      text: "Hi! Ask me anything — I'll find the best answer by comparing multiple AI models.",
    },
  ]);
  const scrollRef = useRef<ScrollView>(null);

  const sendPrompt = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: input,
    };
    setMessages((prev) => [...prev, userMsg]);
    const currentPrompt = input;
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: currentPrompt }),
      });
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "ai",
          role: "ai",
          text: data.answer || "Something went wrong, please try again.",
        },
      ]);
    } catch (err) {
      console.error("Request failed:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "ai",
          role: "ai",
          text: "Could not connect to server. Make sure backend is running and you're on the same WiFi.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#0f0c29", "#1a1a3e", "#24243e"]} className="flex-1">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <View className="px-5 pt-16 pb-4 border-b border-white/10">
          <Text className="text-white text-2xl font-bold">MultiMind AI</Text>
          <Text className="text-gray-400 text-sm mt-1">
            Best answer from Gemini, Groq & DeepSeek
          </Text>
        </View>

        {/* Chat messages */}
        <ScrollView
          ref={scrollRef}
          className="flex-1 px-4 pt-4"
          contentContainerStyle={{ paddingBottom: 16 }}
          onContentSizeChange={() =>
            scrollRef.current?.scrollToEnd({ animated: true })
          }
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((msg) => (
            <View
              key={msg.id}
              className={`mb-3 max-w-[85%] ${
                msg.role === "user" ? "self-end" : "self-start"
              }`}
            >
              {msg.role === "ai" && (
                <View className="flex-row items-center mb-1 ml-1">
                  <Ionicons name="sparkles" size={12} color="#c084fc" />
                  <Text className="text-purple-300 text-xs font-semibold ml-1">
                    Best Answer
                  </Text>
                </View>
              )}
              <View
                className={`px-4 py-3 rounded-2xl ${
                  msg.role === "user"
                    ? "bg-purple-600 rounded-br-sm"
                    : "bg-white/10 rounded-bl-sm border border-white/10"
                }`}
              >
                <Text className="text-white text-[15px] leading-5">
                  {msg.text}
                </Text>
              </View>
            </View>
          ))}

          {loading && (
            <View className="self-start bg-white/10 px-4 py-3 rounded-2xl rounded-bl-sm border border-white/10 mb-3 flex-row items-center">
              <ActivityIndicator size="small" color="#c084fc" />
              <Text className="text-gray-300 text-sm ml-2">
                Comparing multiple AI models...
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Input bar */}
        <View className="flex-row items-end px-4 py-3 bg-white/5 border-t border-white/10">
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask a question..."
            placeholderTextColor="#9ca3af"
            className="flex-1 bg-white/10 text-white px-4 py-3 rounded-full mr-2 max-h-28"
            multiline
            editable={!loading}
          />
          <TouchableOpacity
            onPress={sendPrompt}
            disabled={loading}
            className={`w-12 h-12 rounded-full items-center justify-center ${
              loading ? "bg-purple-600/40" : "bg-purple-600"
            }`}
          >
            <Ionicons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}