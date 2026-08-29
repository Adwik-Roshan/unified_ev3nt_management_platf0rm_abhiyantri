import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Appbar, BottomNavigation, Text, Card, Button, TextInput, List } from 'react-native-paper';
import { useStore } from '../../store/useStore';

const AnalyticsRoute = () => {
  const teams = useStore(state => state.teams);
  const submissions = useStore(state => state.submissions);
  const scores = useStore(state => state.scores);

  return (
    <ScrollView style={styles.scene}>
      <Text variant="headlineSmall" style={{ marginBottom: 20 }}>Event Analytics</Text>
      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Card.Content>
            <Text variant="titleMedium">Total Teams</Text>
            <Text variant="displaySmall">{teams.length}</Text>
          </Card.Content>
        </Card>
        <Card style={styles.statCard}>
          <Card.Content>
            <Text variant="titleMedium">Submissions</Text>
            <Text variant="displaySmall">{submissions.length}</Text>
          </Card.Content>
        </Card>
      </View>
      <Card style={[styles.statCard, { flex: 1, marginTop: 15 }]}>
          <Card.Content>
            <Text variant="titleMedium">Evaluations Completed</Text>
            <Text variant="displaySmall">{scores.length}</Text>
          </Card.Content>
        </Card>
    </ScrollView>
  );
};

const BroadcastRoute = () => {
  const addAnnouncement = useStore(state => state.addAnnouncement);
  const announcements = useStore(state => state.announcements);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleBroadcast = () => {
    if (title && content) {
      addAnnouncement(title, content);
      setTitle('');
      setContent('');
      alert('Announcement sent globally!');
    }
  };

  return (
    <ScrollView style={styles.scene}>
      <Text variant="titleLarge" style={{ marginBottom: 15 }}>Send Broadcast</Text>
      <TextInput
        label="Title"
        value={title}
        onChangeText={setTitle}
        mode="outlined"
        style={{ marginBottom: 10 }}
      />
      <TextInput
        label="Message Content"
        value={content}
        onChangeText={setContent}
        mode="outlined"
        multiline
        numberOfLines={3}
        style={{ marginBottom: 15 }}
      />
      <Button mode="contained" icon="broadcast" onPress={handleBroadcast}>
        Push Notification
      </Button>

      <Text variant="titleMedium" style={{ marginTop: 30, marginBottom: 10 }}>Recent Broadcasts</Text>
      {announcements.map(a => (
        <List.Item
          key={a.id}
          title={a.title}
          description={a.content}
          left={props => <List.Icon {...props} icon="bullhorn" />}
        />
      ))}
    </ScrollView>
  );
};

export default function OrganizerDashboard() {
  const user = useStore(state => state.user);
  const logout = useStore(state => state.logout);

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'analytics', title: 'Analytics', focusedIcon: 'chart-bar' },
    { key: 'broadcast', title: 'Broadcast', focusedIcon: 'bullhorn' },
  ]);

  const renderScene = BottomNavigation.SceneMap({
    analytics: AnalyticsRoute,
    broadcast: BroadcastRoute,
  });

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title={`Organizer: ${user.name}`} subtitle="Command Center" />
        <Appbar.Action icon="logout" onPress={logout} />
      </Appbar.Header>
      <BottomNavigation
        navigationState={{ index, routes }}
        onIndexChange={setIndex}
        renderScene={renderScene}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scene: { flex: 1, padding: 15 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  statCard: { flex: 0.48, backgroundColor: '#f0f0f0' },
});
