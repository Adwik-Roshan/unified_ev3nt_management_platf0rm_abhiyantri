import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Appbar, BottomNavigation, Text, Card, Button, Avatar, List } from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';
import { useStore } from '../../store/useStore';

const AnnouncementsRoute = () => {
  const announcements = useStore(state => state.announcements);
  return (
    <ScrollView style={styles.scene}>
      {announcements.map(a => (
        <Card key={a.id} style={styles.card}>
          <Card.Title title={a.title} subtitle={new Date(a.created_at).toLocaleString()} />
          <Card.Content>
            <Text>{a.content}</Text>
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );
};

const CheckInRoute = () => {
  const user = useStore(state => state.user);
  return (
    <View style={[styles.scene, styles.center]}>
      <Text variant="headlineSmall" style={{ marginBottom: 20 }}>Your Check-in QR Code</Text>
      <View style={styles.qrContainer}>
        <QRCode value={`CHECKIN:${user.id}`} size={200} />
      </View>
      <Text style={{ marginTop: 20, color: '#666' }}>ID: {user.id}</Text>
    </View>
  );
};

const TeamsRoute = () => {
  const teams = useStore(state => state.teams);
  return (
    <ScrollView style={styles.scene}>
      <Text variant="titleMedium" style={{ marginBottom: 10 }}>Looking for members</Text>
      {teams.filter(t => t.lookingForMembers).map(t => (
        <List.Item
          key={t.id}
          title={t.name}
          description={`${t.members.length} members`}
          left={props => <List.Icon {...props} icon="account-group" />}
          right={props => <Button mode="contained-tonal" onPress={() => alert('Request sent!')} style={{ alignSelf: 'center' }}>Join</Button>}
        />
      ))}
      <Text variant="titleMedium" style={{ marginTop: 20, marginBottom: 10 }}>All Teams</Text>
      {teams.filter(t => !t.lookingForMembers).map(t => (
        <List.Item
          key={t.id}
          title={t.name}
          description={`${t.members.length} members`}
          left={props => <List.Icon {...props} icon="check-circle" />}
        />
      ))}
    </ScrollView>
  );
};

const LeaderboardRoute = () => {
  const scores = useStore(state => state.scores);
  const submissions = useStore(state => state.submissions);

  // Calculate total scores per submission
  const leaderboard = submissions.map(sub => {
    const subScores = scores.filter(s => s.submission_id === sub.id);
    const total = subScores.reduce((sum, s) => sum + Number(s.score), 0);
    return { ...sub, total_score: total };
  }).sort((a, b) => b.total_score - a.total_score);

  return (
    <ScrollView style={styles.scene}>
      {leaderboard.map((item, index) => (
        <List.Item
          key={item.id}
          title={`${index + 1}. ${item.project_name}`}
          description={`Score: ${item.total_score}`}
          left={props => <Avatar.Text size={40} label={item.project_name.substring(0, 2)} style={{marginRight: 10}} />}
        />
      ))}
    </ScrollView>
  );
};

export default function ParticipantDashboard() {
  const user = useStore(state => state.user);
  const logout = useStore(state => state.logout);

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'announcements', title: 'Feed', focusedIcon: 'bell', unfocusedIcon: 'bell-outline' },
    { key: 'checkin', title: 'Check-in', focusedIcon: 'qrcode-scan' },
    { key: 'teams', title: 'Teams', focusedIcon: 'account-group', unfocusedIcon: 'account-group-outline' },
    { key: 'leaderboard', title: 'Leaderboard', focusedIcon: 'trophy', unfocusedIcon: 'trophy-outline' },
  ]);

  const renderScene = BottomNavigation.SceneMap({
    announcements: AnnouncementsRoute,
    checkin: CheckInRoute,
    teams: TeamsRoute,
    leaderboard: LeaderboardRoute,
  });

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title={`Hello, ${user.name}`} subtitle="Participant Dashboard" />
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
  center: { justifyContent: 'center', alignItems: 'center' },
  card: { marginBottom: 15 },
  qrContainer: { padding: 20, backgroundColor: '#fff', elevation: 4, borderRadius: 10 }
});
