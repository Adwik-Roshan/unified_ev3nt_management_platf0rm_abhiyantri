import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput, Button, SegmentedButtons } from 'react-native-paper';
import { useStore } from '../store/useStore';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('participant');
  const login = useStore(state => state.login);

  const handleLogin = () => {
    if (email.trim()) {
      login(email.trim(), role);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineLarge" style={styles.title}>Smart Event Manager</Text>
      <Text variant="bodyLarge" style={styles.subtitle}>Abhiyantri Hackathon</Text>

      <TextInput
        label="Email Address"
        value={email}
        onChangeText={setEmail}
        mode="outlined"
        style={styles.input}
        autoCapitalize="none"
      />

      <SegmentedButtons
        value={role}
        onValueChange={setRole}
        buttons={[
          { value: 'participant', label: 'Participant' },
          { value: 'judge', label: 'Judge' },
          { value: 'organizer', label: 'Organizer' },
        ]}
        style={styles.roleSelector}
      />

      <Button mode="contained" onPress={handleLogin} style={styles.button}>
        Login / Register
      </Button>

      <Text style={styles.hint}>
        Hint: Use participant@test.com, judge@test.com, or organizer@test.com for pre-configured roles, or enter any email to create a new user on the fly.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 40,
    color: '#666',
  },
  input: {
    marginBottom: 20,
  },
  roleSelector: {
    marginBottom: 30,
  },
  button: {
    paddingVertical: 8,
  },
  hint: {
    marginTop: 40,
    textAlign: 'center',
    color: '#888',
    fontSize: 12,
  }
});
