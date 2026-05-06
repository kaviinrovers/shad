import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import ChatService from '../services/ChatService';
import type { Message } from '../services/ChatService';

export default function ChatScreen({ navigation }: any) {
  const { user, userProfile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const partnerId = userProfile?.partner || '';

  useEffect(() => {
    // Load message history
    if (partnerId) {
      ChatService.getMessageHistory(partnerId).then(history => {
        setMessages(history || []);
      });
    }

    // Listen for new messages
    const unsubMsg = ChatService.onMessage((message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    // Listen for typing
    const unsubTyping = ChatService.onTyping((_userId: string, isTyping: boolean) => {
      setIsPartnerTyping(isTyping);
    });

    return () => {
      unsubMsg();
      unsubTyping();
    };
  }, [partnerId]);

  const handleSend = () => {
    if (!inputText.trim() || !user?.uid || !partnerId) return;

    const newMessage: Message = {
      from: user.uid,
      to: partnerId,
      text: inputText.trim(),
      timestamp: Date.now(),
      type: 'text',
    };

    // Add to local state immediately for instant feedback
    setMessages(prev => [...prev, newMessage]);

    // Send to server
    ChatService.sendMessage(partnerId, user.uid, inputText.trim());
    ChatService.sendStopTyping(partnerId, user.uid);
    setInputText('');
  };

  const handleTextChange = (text: string) => {
    setInputText(text);
    if (partnerId && user?.uid) {
      if (text.length > 0) {
        ChatService.sendTyping(partnerId, user.uid);
      } else {
        ChatService.sendStopTyping(partnerId, user.uid);
      }
    }
  };

  const formatTime = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMine = item.from === user?.uid;

    return (
      <View style={[styles.messageBubbleRow, isMine && styles.myMessageRow]}>
        <View
          style={[
            styles.messageBubble,
            isMine ? styles.myBubble : styles.theirBubble,
          ]}
        >
          <Text style={[styles.messageText, isMine && styles.myMessageText]}>
            {item.text}
          </Text>
          <Text style={[styles.messageTime, isMine && styles.myTimeText]}>
            {formatTime(item.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerName}>
            {partnerId ? 'My Love 💕' : 'No Partner Connected'}
          </Text>
          {isPartnerTyping && (
            <Text style={styles.typingText}>typing...</Text>
          )}
        </View>
        <View style={styles.headerRight} />
      </View>

      {/* Messages or Empty State */}
      {!partnerId ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>💌</Text>
          <Text style={styles.emptyTitle}>No Partner Connected</Text>
          <Text style={styles.emptySubtitle}>
            Go to Home and connect with your partner first!
          </Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item, index) => item.id || `${item.timestamp}-${index}`}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          onLayout={() => flatListRef.current?.scrollToEnd()}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>💬</Text>
              <Text style={styles.emptyTitle}>No messages yet</Text>
              <Text style={styles.emptySubtitle}>Send the first message to your love!</Text>
            </View>
          }
        />
      )}

      {/* Input Bar */}
      {partnerId ? (
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            placeholderTextColor={COLORS.textMuted}
            value={inputText}
            onChangeText={handleTextChange}
            multiline
            maxLength={2000}
          />
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Text style={styles.sendButtonText}>➤</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    paddingVertical: SPACING.sm,
    paddingRight: SPACING.md,
  },
  backText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerName: {
    ...FONTS.regular,
    fontWeight: '700',
    fontSize: 17,
  },
  typingText: {
    ...FONTS.caption,
    color: COLORS.primaryLight,
    fontStyle: 'italic',
    marginTop: 2,
  },
  headerRight: {
    width: 60,
  },
  messageList: {
    flexGrow: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  messageBubbleRow: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
    justifyContent: 'flex-start',
  },
  myMessageRow: {
    justifyContent: 'flex-end',
  },
  messageBubble: {
    maxWidth: '78%',
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderRadius: RADIUS.lg,
  },
  myBubble: {
    backgroundColor: COLORS.sentBubble,
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    backgroundColor: COLORS.receivedBubble,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  messageText: {
    ...FONTS.regular,
    fontSize: 15,
    lineHeight: 21,
  },
  myMessageText: {
    color: COLORS.textOnPrimary,
  },
  messageTime: {
    ...FONTS.caption,
    marginTop: 4,
    textAlign: 'right',
  },
  myTimeText: {
    color: 'rgba(255,255,255,0.7)',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  textInput: {
    flex: 1,
    backgroundColor: COLORS.inputBackground,
    borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    fontSize: 15,
    color: COLORS.textPrimary,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  sendButtonText: {
    fontSize: 20,
    color: COLORS.textOnPrimary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    ...FONTS.subtitle,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    ...FONTS.small,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});
