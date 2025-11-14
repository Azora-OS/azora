import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import api from '../services/api';

export default function WalletScreen() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    loadWallet();
  }, []);

  const loadWallet = async () => {
    try {
      const { data } = await api.get('/wallet/balance');
      setBalance(data.balance);
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error('Failed to load wallet', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Total Balance</Text>
        <Text style={styles.balanceValue}>{balance} AZR</Text>
      </View>
      <Text style={styles.sectionTitle}>Recent Transactions</Text>
      <FlatList
        data={transactions}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }) => (
          <View style={styles.transactionCard}>
            <Text style={styles.transactionType}>{item.type}</Text>
            <Text style={styles.transactionAmount}>{item.amount} AZR</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  balanceCard: { backgroundColor: '#3B82F6', padding: 30, borderRadius: 12, marginBottom: 20, alignItems: 'center' },
  balanceLabel: { fontSize: 14, color: '#fff', opacity: 0.8 },
  balanceValue: { fontSize: 36, fontWeight: 'bold', color: '#fff', marginTop: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 15 },
  transactionCard: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between' },
  transactionType: { fontSize: 16 },
  transactionAmount: { fontSize: 16, fontWeight: '600', color: '#3B82F6' },
});
