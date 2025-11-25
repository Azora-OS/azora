import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function WalletScreen() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    loadWallet();
  }, []);

  const loadWallet = async () => {
    try {
      const [walletData, txData] = await Promise.all([
        api.mint.getWallet(user.id),
        api.mint.getTransactions(user.id)
      ]);
      setWallet(walletData.data);
      setTransactions(txData.data || []);
    } catch (error) {
      console.error('Load wallet error:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Total Balance</Text>
        <Text style={styles.balanceValue}>{wallet?.balances?.AZR || 0} AZR</Text>
        <Text style={styles.balanceUsd}>≈ ${((wallet?.balances?.AZR || 0) * 0.05).toFixed(2)} USD</Text>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionBtnText}>Send</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionBtnText}>Receive</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionBtnText}>Convert</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Recent Transactions</Text>
      {transactions.slice(0, 10).map((tx: any) => (
        <View key={tx.id} style={styles.txCard}>
          <View>
            <Text style={styles.txType}>{tx.type}</Text>
            <Text style={styles.txDate}>{new Date(tx.timestamp).toLocaleDateString()}</Text>
          </View>
          <Text style={[styles.txAmount, tx.from === user.id && styles.txAmountNegative]}>
            {tx.from === user.id ? '-' : '+'}{tx.amount} {tx.currency}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  balanceCard: { backgroundColor: '#3B4F6F', padding: 24, margin: 16, borderRadius: 16, alignItems: 'center' },
  balanceLabel: { fontSize: 14, color: '#fff', opacity: 0.8 },
  balanceValue: { fontSize: 36, fontWeight: 'bold', color: '#fff', marginTop: 8 },
  balanceUsd: { fontSize: 16, color: '#fff', opacity: 0.8, marginTop: 4 },
  actionsContainer: { flexDirection: 'row', padding: 16, gap: 12 },
  actionBtn: { flex: 1, backgroundColor: '#fff', padding: 16, borderRadius: 8, alignItems: 'center' },
  actionBtnText: { fontSize: 14, fontWeight: '600', color: '#3B4F6F' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', padding: 16, paddingBottom: 8 },
  txCard: { backgroundColor: '#fff', padding: 16, marginHorizontal: 16, marginBottom: 8, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  txType: { fontSize: 14, fontWeight: '600', color: '#333', textTransform: 'capitalize' },
  txDate: { fontSize: 12, color: '#999', marginTop: 4 },
  txAmount: { fontSize: 16, fontWeight: 'bold', color: '#4CAF50' },
  txAmountNegative: { color: '#F44336' }
});
