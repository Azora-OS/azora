import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, Button, Avatar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUbuntu } from '../contexts/UbuntuContext';
import { AzoraTheme } from '../theme/AzoraTheme';

export default function HomeScreen() {
  const { greeting, philosophy } = useUbuntu();
  
  const getAppFeatures = () => {
    const appType = 'azora-marketplace-mobile'.split('-')[1];
    switch(appType) {
      case 'student':
        return ['AI Tutoring', 'Course Progress', 'Peer Learning', 'AZR Earnings'];
      case 'enterprise':
        return ['Team Management', 'Analytics', 'Resource Planning', 'Ubuntu Metrics'];
      case 'marketplace':
        return ['Job Matching', 'Skill Assessment', 'Networking', 'Opportunities'];
      case 'pay':
        return ['Multi-Currency Wallet', 'Mining Dashboard', 'Transactions', 'Ubuntu Sharing'];
      default:
        return ['Ubuntu Features', 'AI Integration', 'Community', 'Prosperity'];
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Avatar.Icon 
            size={64} 
            icon="diamond-stone" 
            style={{ backgroundColor: AzoraTheme.colors.ubuntu.sapphire }}
          />
          <Text variant="headlineMedium" style={styles.title}>
            Azora Mobile
          </Text>
          <Text variant="bodyMedium" style={styles.greeting}>
            {greeting()}
          </Text>
        </View>

        <Card style={styles.philosophyCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.philosophyTitle}>
              Ubuntu Philosophy
            </Text>
            <Text variant="bodyMedium" style={styles.philosophy}>
              {philosophy}
            </Text>
          </Card.Content>
        </Card>

        <View style={styles.featuresContainer}>
          <Text variant="titleLarge" style={styles.featuresTitle}>
            Features
          </Text>
          {getAppFeatures().map((feature, index) => (
            <Card key={index} style={styles.featureCard}>
              <Card.Content style={styles.featureContent}>
                <Avatar.Icon 
                  size={40} 
                  icon="check-circle" 
                  style={{ backgroundColor: AzoraTheme.colors.ubuntu.emerald }}
                />
                <Text variant="bodyLarge" style={styles.featureText}>
                  {feature}
                </Text>
              </Card.Content>
            </Card>
          ))}
        </View>

        <Button 
          mode="contained" 
          style={styles.actionButton}
          onPress={() => console.log('Ubuntu action!')}
        >
          Start Ubuntu Journey
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AzoraTheme.colors.background,
  },
  content: {
    padding: AzoraTheme.ubuntu.spacing.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: AzoraTheme.ubuntu.spacing.lg,
  },
  title: {
    marginTop: AzoraTheme.ubuntu.spacing.sm,
    color: AzoraTheme.colors.ubuntu.sapphire,
    fontWeight: 'bold',
  },
  greeting: {
    marginTop: AzoraTheme.ubuntu.spacing.xs,
    color: AzoraTheme.colors.ubuntu.emerald,
  },
  philosophyCard: {
    marginBottom: AzoraTheme.ubuntu.spacing.lg,
    backgroundColor: AzoraTheme.colors.ubuntu.unity,
  },
  philosophyTitle: {
    color: AzoraTheme.colors.ubuntu.sapphire,
    fontWeight: 'bold',
  },
  philosophy: {
    marginTop: AzoraTheme.ubuntu.spacing.xs,
    fontStyle: 'italic',
  },
  featuresContainer: {
    marginBottom: AzoraTheme.ubuntu.spacing.lg,
  },
  featuresTitle: {
    marginBottom: AzoraTheme.ubuntu.spacing.md,
    color: AzoraTheme.colors.ubuntu.sapphire,
    fontWeight: 'bold',
  },
  featureCard: {
    marginBottom: AzoraTheme.ubuntu.spacing.sm,
  },
  featureContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    marginLeft: AzoraTheme.ubuntu.spacing.md,
    flex: 1,
  },
  actionButton: {
    backgroundColor: AzoraTheme.colors.ubuntu.sapphire,
  },
});