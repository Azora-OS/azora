import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';

export default function WalletScreen() {
    // Mock data
    const balance = "1,250.00";
    const transactions = [
        { id: 1, type: 'Received', amount: '+ 500 AZR', from: 'Job: Smart Contract Audit', date: 'Today' },
        { id: 2, type: 'Sent', amount: '- 50 AZR', to: 'Course: Advanced Solidity', date: 'Yesterday' },
        { id: 3, type: 'Received', amount: '+ 100 AZR', from: 'Staking Reward', date: 'Oct 24' },
    ];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Azora Wallet</Text>
            </View>

            <View style={styles.balanceCard}>
                <Text style={styles.balanceLabel}>Total Balance</Text>
                <Text style={styles.balanceAmount}>{balance} AZR</Text>
                <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.button}>
                        <Text style={styles.buttonText}>Send</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button}>
                        <Text style={styles.buttonText}>Receive</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Transactions</Text>
                <ScrollView style={styles.transactionList}>
                    {transactions.map(tx => (
                        <View key={tx.id} style={styles.transactionItem}>
                            <View>
                                <Text style={styles.txType}>{tx.type}</Text>
                                <Text style={styles.txDetail}>{tx.from || tx.to}</Text>
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                                <Text style={[styles.txAmount, { color: tx.type === 'Received' ? '#48bb78' : '#f56565' }]}>
                                    {tx.amount}
                                </Text>
                                <Text style={styles.txDate}>{tx.date}</Text>
                            </View>
                        </View>
                    ))}
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f7fafc',
    },
    header: {
        padding: 20,
        paddingTop: 60,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#edf2f7',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2d3748',
    },
    balanceCard: {
        margin: 20,
        padding: 25,
        backgroundColor: '#667eea',
        borderRadius: 20,
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    balanceLabel: {
        color: '#e2e8f0',
        fontSize: 16,
    },
    balanceAmount: {
        color: '#fff',
        fontSize: 36,
        fontWeight: 'bold',
        marginVertical: 10,
    },
    actionButtons: {
        flexDirection: 'row',
        marginTop: 20,
        gap: 15,
    },
    button: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.2)',
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    section: {
        flex: 1,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4a5568',
        marginBottom: 15,
    },
    transactionList: {
        flex: 1,
    },
    transactionItem: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    txType: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2d3748',
    },
    txDetail: {
        fontSize: 14,
        color: '#718096',
        marginTop: 2,
    },
    txAmount: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    txDate: {
        fontSize: 12,
        color: '#a0aec0',
        marginTop: 2,
    },
});
