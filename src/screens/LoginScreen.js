import React, { useState, useRef } from 'react';
import { View, StyleSheet, Animated, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { Text, TextInput, Button, Menu, Card, Title, Paragraph } from 'react-native-paper';
import { useStore } from '../store/useStore';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const login = useStore(state => state.login);
  
  // Animation values for smooth transition
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const handleLogin = () => {
    if (email.trim() && role) {
      login(email.trim(), role);
    }
  };

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setMenuVisible(false);
    
    // Trigger fade-in and slide-up transition for the email input
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: false, // false because opacity/transform might need layout on web
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: false,
      })
    ]).start();
  };

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const getRoleLabel = () => {
    if (!role) return 'Select your role...';
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.backgroundAccent} />
      
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.header}>
             <Title style={styles.title}>Smart Event Manager</Title>
             <Paragraph style={styles.subtitle}>Abhiyantri Hackathon</Paragraph>
          </View>

          <Menu
            visible={menuVisible}
            onDismiss={closeMenu}
            anchor={
              <Button 
                mode="outlined" 
                onPress={openMenu} 
                style={styles.dropdownButton}
                contentStyle={styles.dropdownContent}
                icon="chevron-down"
                labelStyle={role ? styles.dropdownLabelSelected : styles.dropdownLabelPlaceholder}
              >
                {getRoleLabel()}
              </Button>
            }
          >
            <Menu.Item onPress={() => handleRoleSelect('participant')} title="Participant" />
            <Menu.Item onPress={() => handleRoleSelect('judge')} title="Judge" />
            <Menu.Item onPress={() => handleRoleSelect('organizer')} title="Organizer" />
          </Menu>

          {/* This view only becomes visible after a role is selected */}
          <Animated.View 
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              width: '100%',
              alignItems: 'center',
            }}
          >
            <TextInput
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
              disabled={!role}
            />

            <Button 
              mode="contained" 
              onPress={handleLogin} 
              style={styles.loginButton}
              contentStyle={styles.loginButtonContent}
              disabled={!role || !email.trim()}
            >
              Continue
            </Button>
          </Animated.View>
        </Card.Content>
      </Card>
      
      <Text style={styles.hint}>
        Hint: Use participant@test.com, judge@test.com, or organizer@test.com
      </Text>
    </KeyboardAvoidingView>
  );
}

const { width } = Dimensions.get('window');
const maxWidth = Math.min(width * 0.9, 400);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  backgroundAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: '#6200ee',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  card: {
    width: maxWidth, // Enforces reasonable length
    borderRadius: 16,
    elevation: 8, // shadow for android
    shadowColor: '#000', // shadow for ios/web
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    backgroundColor: '#fff',
  },
  cardContent: {
    alignItems: 'center',
    padding: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#333',
    textAlign: 'center',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  dropdownButton: {
    width: '100%',
    marginBottom: 20,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  dropdownContent: {
    height: 50,
    justifyContent: 'flex-start',
  },
  dropdownLabelPlaceholder: {
    color: '#888',
    fontSize: 16,
  },
  dropdownLabelSelected: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    width: '100%',
    marginBottom: 24,
    backgroundColor: '#fff',
  },
  loginButton: {
    width: '100%',
    borderRadius: 8,
  },
  loginButtonContent: {
    height: 50,
  },
  hint: {
    marginTop: 30,
    color: '#888',
    fontSize: 13,
    textAlign: 'center',
  }
});
