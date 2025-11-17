import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, Avatar } from 'react-native-paper';
import { AzoraTheme } from '../azora-student-mobile/src/theme/AzoraTheme';

export function UbuntuGem({ size = 64 }: { size?: number }) {
  return (
    <View style={styles.gemContainer}>
      <Avatar.Icon 
        size={size} 
        icon="diamond-stone" 
        style={[styles.gem, { backgroundColor: AzoraTheme.colors.ubuntu.sapphire }]}
      />
    </View>
  );
}

export function UbuntuCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card style={styles.ubuntuCard}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.cardTitle}>
          {title}
        </Text>
        {children}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  gemContainer: {
    alignItems: 'center',
  },
  gem: {
    backgroundColor: AzoraTheme.colors.ubuntu.sapphire,
  },
  ubuntuCard: {
    backgroundColor: AzoraTheme.colors.ubuntu.unity,
    marginVertical: AzoraTheme.ubuntu.spacing.sm,
  },
  cardTitle: {
    color: AzoraTheme.colors.ubuntu.sapphire,
    fontWeight: 'bold',
    marginBottom: AzoraTheme.ubuntu.spacing.sm,
  },
});