import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, RefreshControl, ActivityIndicator } from 'react-native';
import api from '../services/api';
import { OfflineSyncService } from '../services/offlineSync';

export default function WalletScreen() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const handleWithdrawal = async () => {
    if (balance <= 0) {
      Alert.alert('Error', 'Insufficient balance for withdrawal');
      return;
    }

    Alert.prompt(
      'Withdrawal Amount',
      `Available balance: ${balance} AZR`,
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Withdraw',
          onPress: async (amount) => {
            if (!amount || isNaN(Number(amount))) {
              Alert.alert('Error', 'Please enter a valid amount');
              return;
            }

            const withdrawAmount = Number(amount);
            if (withdrawAmount > balance) {
              Alert.alert('Error', 'Withdrawal amount exceeds balance');
              return;
            }

            setLoading(true);
            try {
              await api.post('/wallet/withdraw', { amount: withdrawAmount });
              Alert.alert('Success', 'Withdrawal request submitted');
              await loadWallet();
            } catch (error) {
              Alert.alert('Error', 'Failed to process withdrawal');
            } finally {
              setLoading(false);
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const handleAddFunds = async () => {
    Alert.prompt(
      'Add Funds',
      'Enter amount to add (USD)',
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Add',
          onPress: async (amount) => {
            if (!amount || isNaN(Number(amount))) {
              Alert.alert('Error', 'Please enter a valid amount');
              return;
            }

            setLoading(true);
            try {
              // Queue payment operation for offline support
              await OfflineSyncService.queueOperation(
                'POST',
                '/wallet/add-funds',
                { amount: Number(amount), timestamp: new Date().toISOString() }
              );
              Alert.alert('Success', 'Payment request queued (will process when online)');
              await loadWallet();
            } catch (error) {
              Alert.alert('Error', 'Failed to add funds');
            } finally {
              setLoading(false);
            }
          },
        },
      ],
      'decimal-pad'
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWallet();
    setRefreshing(false);
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'earned':
        return '#10B981';
      case 'spent':
        return '#EF4444';
      case 'withdrawal':
        return '#F59E0B';
      default:
        return '#3B82F6';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Total Balance</Text>
        <Text style={styles.balanceValue}>{balance} AZR</Text>
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, loading && styles.buttonDisabled]}
            onPress={handleAddFunds}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.actionButtonText}>+ Add Funds</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.withdrawButton, loading && styles.buttonDisabled]}
            onPress={handleWithdrawal}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.actionButtonText}>Withdraw</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Recent Transactions</Text>
      <FlatList
        data={transactions}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }) => (
          <View style={styles.transactionCard}>
            <View style={styles.transactionInfo}>
              <Text style={styles.transactionType}>{item.type}</Text>
              <Text style={styles.transactionDate}>{new Date(item.date).toLocaleDateString()}</Text>
            </View>
            <Text style={[styles.transactionAmount, { color: getTransactionColor(item.type) }]}>
              {item.type === 'earned' || item.type === 'withdrawal' ? '+' : '-'}{item.amount} AZR
            </Text>
          </View>
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No transactions yet</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  balanceCard: { backgroundColor: '#3B82F6', padding: 30, margin: 20, borderRadius: 12, alignItems: 'center' },
  balanceLabel: { fontSize: 14, color: '#fff', opacity: 0.8 },
  balanceValue: { fontSize: 36, fontWeight: 'bold', color: '#fff', marginTop: 8, marginBottom: 20 },
  actionButtonsContainer: { flexDirection: 'row', gap: 12, width: '100%' },
  actionButton: { flex: 1, backgroundColor: '#fff', padding: 12, borderRadius: 8, alignItems: 'center' },
  withdrawButton: { backgroundColor: '#F59E0B' },
  actionButtonText: { fontSize: 14, fontWeight: '600', color: '#3B82F6' },
  buttonDisabled: { opacity: 0.6 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 15, marginHorizontal: 20 },
  transactionCard: { backgroundColor: '#fff', padding: 15, marginHorizontal: 20, marginBottom: 10, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  transactionInfo: { flex: 1 },
  transactionType: { fontSize: 16, fontWeight: '600', color: '#333' },
  transactionDate: { fontSize: 12, color: '#999', marginTop: 4 },
  transactionAmount: { fontSize: 16, fontWeight: '600' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 16, color: '#999' },
});
