import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
} from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

export default function HomeScreen({ navigation }: any) {
  const { user, userProfile, logout } = useAuth();
  const [partnerEmail, setPartnerEmail] = useState('');

  const handleConnectPartner = async () => {
    if (!partnerEmail.trim()) {
      Alert.alert('Error', 'Please enter your partner\'s email');
      return;
    }
    try {
      const AuthApi = (await import('../services/AuthApi')).default;
      const resp = await AuthApi.connectWithPartner(partnerEmail.trim());
      if (resp.success) {
        Alert.alert('Success', 'Connected to your partner! 💕');
        setPartnerEmail('');
      } else {
        Alert.alert('Error', resp.error || 'Could not connect');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.name}>
            {userProfile?.displayName || userProfile?.nickname || user?.email || 'User'} 💖
          </Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(userProfile?.displayName || user?.email || '?')[0].toUpperCase()}
          </Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{userProfile?.displayName || 'Your Name'}</Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>
          <View style={[styles.statusBadge, { backgroundColor: COLORS.online }]}>
            <Text style={styles.statusText}>Online</Text>
          </View>
        </View>
      </View>

      {/* Connect Partner */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Connect with Partner</Text>
        <View style={styles.connectRow}>
          <TextInput
            style={styles.connectInput}
            placeholder="Partner's email"
            placeholderTextColor={COLORS.textMuted}
            value={partnerEmail}
            onChangeText={setPartnerEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.connectButton} onPress={handleConnectPartner}>
            <Text style={styles.connectButtonText}>Connect</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Chat')}
          >
            <Text style={styles.actionEmoji}>💬</Text>
            <Text style={styles.actionLabel}>Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionEmoji}>📞</Text>
            <Text style={styles.actionLabel}>Call</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionEmoji}>📸</Text>
            <Text style={styles.actionLabel}>Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionEmoji}>💕</Text>
            <Text style={styles.actionLabel}>Timeline</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xxl + SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  greeting: {
    ...FONTS.small,
    color: COLORS.textMuted,
  },
  name: {
    ...FONTS.subtitle,
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  logoutText: {
    color: COLORS.error,
    fontSize: 13,
    fontWeight: '600',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textOnPrimary,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...FONTS.regular,
    fontWeight: '600',
  },
  profileEmail: {
    ...FONTS.small,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    marginTop: 4,
  },
  statusText: {
    fontSize: 10,
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    ...FONTS.regular,
    fontWeight: '600',
    marginBottom: SPACING.sm,
    color: COLORS.textSecondary,
  },
  connectRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  connectInput: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  connectButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg,
    justifyContent: 'center',
  },
  connectButtonText: {
    color: COLORS.textOnPrimary,
    fontWeight: '700',
    fontSize: 14,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  actionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    width: '48%',
    borderWidth: 1,
    borderColor: COLORS.border,
    flexGrow: 1,
    flexBasis: '45%',
  },
  actionEmoji: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  actionLabel: {
    ...FONTS.regular,
    fontWeight: '600',
    fontSize: 14,
  },
});
