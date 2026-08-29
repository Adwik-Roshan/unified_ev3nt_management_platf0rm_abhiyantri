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
      <Text variant="headlineSmall" style={{ marginBottom: 5, fontWeight: 'bold' }}>Team Discovery</Text>
      <Text style={{ color: '#666', marginBottom: 20 }}>Find your squad and join forces.</Text>

      <Text variant="titleMedium" style={{ marginBottom: 10, color: '#6200ee', fontWeight: 'bold' }}>Looking for members</Text>
      {teams.filter(t => t.looking_for_members).map(t => (
        <Card key={t.id} style={styles.teamCard}>
          <Card.Title 
            title={t.name} 
            subtitle={`${t.members_count} member(s)`} 
            left={props => <Avatar.Icon {...props} icon="account-group" style={{ backgroundColor: '#03dac6' }} />}
          />
          <Card.Actions>
            <Button mode="contained" onPress={() => alert('Request sent to join team!')}>Join Team</Button>
          </Card.Actions>
        </Card>
      ))}

      <Text variant="titleMedium" style={{ marginTop: 20, marginBottom: 10, fontWeight: 'bold' }}>All Teams</Text>
      {teams.filter(t => !t.looking_for_members).map(t => (
        <Card key={t.id} style={styles.teamCardClosed}>
          <Card.Title 
            title={t.name} 
            subtitle={`${t.members_count} member(s)`} 
            left={props => <Avatar.Icon {...props} icon="check-circle" style={{ backgroundColor: '#e0e0e0' }} />}
          />
        </Card>
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

  const getTrophyColor = (index) => {
    if (index === 0) return '#FFD700'; // Gold
    if (index === 1) return '#C0C0C0'; // Silver
    if (index === 2) return '#CD7F32'; // Bronze
    return '#e0e0e0';
  };

  return (
    <ScrollView style={styles.scene}>
      <Text variant="headlineSmall" style={{ marginBottom: 5, fontWeight: 'bold' }}>Live Leaderboard</Text>
      <Text style={{ color: '#666', marginBottom: 20 }}>Real-time rankings based on judge evaluations.</Text>

      {leaderboard.map((item, index) => (
        <Card key={item.id} style={[styles.card, { borderColor: index < 3 ? getTrophyColor(index) : 'transparent', borderWidth: index < 3 ? 2 : 0 }]}>
          <List.Item
            title={`${index + 1}. ${item.project_name}`}
            titleStyle={{ fontWeight: index < 3 ? 'bold' : 'normal', fontSize: index < 3 ? 18 : 16 }}
            description={`Total Score: ${item.total_score} pts`}
            left={props => (
              <Avatar.Icon 
                {...props} 
                icon={index < 3 ? "trophy" : "medal"} 
                style={{ backgroundColor: getTrophyColor(index), marginRight: 10 }} 
                color={index < 3 ? '#000' : '#666'}
              />
            )}
            right={props => (
              <View style={{ justifyContent: 'center' }}>
                <Text variant="titleLarge" style={{ fontWeight: 'bold', color: '#6200ee' }}>{item.total_score}</Text>
              </View>
            )}
          />
        </Card>
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
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scene: { flex: 1, padding: 20 },
  center: { justifyContent: 'center', alignItems: 'center' },
  card: { marginBottom: 15, backgroundColor: '#fff', borderRadius: 12, elevation: 2 },
  teamCard: { marginBottom: 15, backgroundColor: '#fff', borderRadius: 12, elevation: 3, borderLeftWidth: 5, borderLeftColor: '#03dac6' },
  teamCardClosed: { marginBottom: 15, backgroundColor: '#f0f0f0', borderRadius: 12, elevation: 1 },
  qrContainer: { padding: 20, backgroundColor: '#fff', elevation: 4, borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }
});
