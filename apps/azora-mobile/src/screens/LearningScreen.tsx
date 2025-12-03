import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image } from 'react-native';

export default function LearningScreen() {
    const courses = [
        { id: 1, title: 'Intro to Constitutional AI', progress: 0.75, color: '#ed8936' },
        { id: 2, title: 'Solidity for Beginners', progress: 0.30, color: '#48bb78' },
        { id: 3, title: 'Ubuntu Philosophy', progress: 0.10, color: '#4299e1' },
    ];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Learning</Text>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.statsContainer}>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>12</Text>
                        <Text style={styles.statLabel}>Hours</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>3</Text>
                        <Text style={styles.statLabel}>Courses</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>850</Text>
                        <Text style={styles.statLabel}>XP</Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Continue Learning</Text>

                {courses.map(course => (
                    <TouchableOpacity key={course.id} style={styles.courseCard}>
                        <View style={[styles.courseIcon, { backgroundColor: course.color }]} />
                        <View style={styles.courseInfo}>
                            <Text style={styles.courseTitle}>{course.title}</Text>
                            <View style={styles.progressBarBg}>
                                <View style={[styles.progressBarFill, { width: `${course.progress * 100}%`, backgroundColor: course.color }]} />
                            </View>
                            <Text style={styles.progressText}>{Math.round(course.progress * 100)}% Complete</Text>
                        </View>
                    </TouchableOpacity>
                ))}

                <View style={styles.promoCard}>
                    <Text style={styles.promoTitle}>New Certification Available</Text>
                    <Text style={styles.promoText}>Become a Certified Azora Developer and earn AZR tokens.</Text>
                    <TouchableOpacity style={styles.promoButton}>
                        <Text style={styles.promoButtonText}>View Details</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
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
    content: {
        flex: 1,
        padding: 20,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    statBox: {
        backgroundColor: '#fff',
        width: '30%',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2d3748',
    },
    statLabel: {
        fontSize: 12,
        color: '#718096',
        marginTop: 5,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4a5568',
        marginBottom: 15,
    },
    courseCard: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 12,
        marginBottom: 15,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    courseIcon: {
        width: 50,
        height: 50,
        borderRadius: 10,
        marginRight: 15,
    },
    courseInfo: {
        flex: 1,
    },
    courseTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2d3748',
        marginBottom: 8,
    },
    progressBarBg: {
        height: 6,
        backgroundColor: '#edf2f7',
        borderRadius: 3,
        marginBottom: 5,
    },
    progressBarFill: {
        height: 6,
        borderRadius: 3,
    },
    progressText: {
        fontSize: 12,
        color: '#718096',
    },
    promoCard: {
        backgroundColor: '#2d3748',
        padding: 20,
        borderRadius: 15,
        marginTop: 10,
        marginBottom: 30,
    },
    promoTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    promoText: {
        color: '#a0aec0',
        fontSize: 14,
        marginBottom: 15,
        lineHeight: 20,
    },
    promoButton: {
        backgroundColor: '#667eea',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    promoButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
});
