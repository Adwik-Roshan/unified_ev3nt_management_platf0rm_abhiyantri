import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Appbar, Text, Card, Button, TextInput, Portal, Modal } from 'react-native-paper';
import { useStore } from '../../store/useStore';

export default function JudgeDashboard() {
  const user = useStore(state => state.user);
  const logout = useStore(state => state.logout);
  const submissions = useStore(state => state.submissions);
  const teams = useStore(state => state.teams);
  const addScore = useStore(state => state.addScore);
  const scores = useStore(state => state.scores);

  const [visible, setVisible] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [scoreInput, setScoreInput] = useState('');
  const [feedbackInput, setFeedbackInput] = useState('');

  const showModal = (submission) => {
    setSelectedSubmission(submission);
    setVisible(true);
  };
  const hideModal = () => {
    setVisible(false);
    setScoreInput('');
    setFeedbackInput('');
  };

  const handleScoring = () => {
    if (selectedSubmission && scoreInput) {
      addScore(selectedSubmission.id, scoreInput, feedbackInput);
      hideModal();
      alert('Score submitted successfully!');
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title={`Judge: ${user.name}`} subtitle="Evaluation Portal" />
        <Appbar.Action icon="logout" onPress={logout} />
      </Appbar.Header>

      <ScrollView style={styles.content}>
        <Text variant="titleLarge" style={{ marginBottom: 15 }}>Projects to Evaluate</Text>
        
        {submissions.map(sub => {
          const team = teams.find(t => t.id === sub.team_id);
          const hasScored = scores.some(s => s.submission_id === sub.id && s.judge_id === user.id);
          return (
            <Card key={sub.id} style={styles.card}>
              <Card.Title title={sub.project_name} subtitle={`Team: ${team?.name}`} />
              <Card.Content>
                <Text>{sub.description}</Text>
                {hasScored && (
                  <Text style={{ color: 'green', marginTop: 10 }}>✓ You have evaluated this project.</Text>
                )}
              </Card.Content>
              <Card.Actions>
                <Button disabled={hasScored} onPress={() => showModal(sub)}>
                  {hasScored ? 'Scored' : 'Evaluate'}
                </Button>
              </Card.Actions>
            </Card>
          )
        })}
      </ScrollView>

      <Portal>
        <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={styles.modalStyle}>
          <Text variant="titleMedium" style={{ marginBottom: 15 }}>
            Evaluate: {selectedSubmission?.project_name}
          </Text>
          <TextInput
            label="Total Score (0-100)"
            value={scoreInput}
            onChangeText={setScoreInput}
            keyboardType="numeric"
            style={{ marginBottom: 15 }}
            mode="outlined"
          />
          <TextInput
            label="Constructive Feedback"
            value={feedbackInput}
            onChangeText={setFeedbackInput}
            multiline
            numberOfLines={4}
            style={{ marginBottom: 15 }}
            mode="outlined"
          />
          <Button mode="contained" onPress={handleScoring}>Submit Evaluation</Button>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 15 },
  card: { marginBottom: 15 },
  modalStyle: { backgroundColor: 'white', padding: 20, margin: 20, borderRadius: 10 }
});
