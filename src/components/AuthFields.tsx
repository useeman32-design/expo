import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppleLogo, GoogleLogo } from '@/components/SocialIcons';
import { C, F, R, S } from '@/theme';

/* ---------------- Social login button ---------------- */
export function SocialButton({
  provider,
  label,
  onPress,
  loading = false,
  style,
}: {
  provider: 'google' | 'apple';
  label: string;
  onPress?: () => void;
  loading?: boolean;
  style?: ViewStyle;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={({ pressed }) => [social.btn, pressed && { opacity: 0.85 }, style]}
    >
      {provider === 'google' ? <GoogleLogo size={20} /> : <AppleLogo size={20} color="#15201A" />}
      <Text style={social.label}>{label}</Text>
      {loading ? (
        <ActivityIndicator size="small" color={C.muted} />
      ) : (
        <View style={{ width: 20 }} />
      )}
    </Pressable>
  );
}

/* ---------------- Labeled input ---------------- */
export function LabeledInput({
  label,
  value,
  onChangeText,
  placeholder,
  secure = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  error,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  secure?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric';
  autoCapitalize?: 'none' | 'sentences' | 'words';
  error?: string;
}) {
  const [show, setShow] = useState(!secure);
  return (
    <View style={field.wrap}>
      <Text style={field.label}>{label}</Text>
      <View style={[field.box, error ? { borderColor: C.negative } : null]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={C.faint}
          secureTextEntry={!show}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          style={field.input}
        />
        {secure ? (
          <Pressable onPress={() => setShow((v) => !v)} style={field.eye}>
            <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={20} color={C.faint} />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={field.error}>{error}</Text> : null}
    </View>
  );
}

const social = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: S.lg,
    height: 52,
    borderRadius: R.md,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.hairline,
  },
  label: {
    flex: 1,
    color: C.ink,
    fontFamily: F.sans,
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 12,
  },
});

const field = StyleSheet.create({
  wrap: { marginBottom: S.lg },
  label: {
    color: C.muted,
    fontFamily: F.sans,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 7,
  },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.hairline,
    borderRadius: R.md,
    paddingHorizontal: 14,
    height: 52,
  },
  input: {
    flex: 1,
    color: C.ink,
    fontFamily: F.sans,
    fontSize: 15.5,
    fontWeight: '500',
  },
  eye: { padding: 4 },
  error: {
    color: C.negative,
    fontFamily: F.sans,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 5,
    marginLeft: 2,
  },
});
