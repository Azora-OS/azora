'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@azora/shared-design/layouts/AppLayout';
import { AccessibleCard, GradientText, Button } from '@azora/shared-design';
import { useUbuntuServices } from '@azora/shared-design/lib/ubuntu-services';

export default function ProfilePage() {
    const [profile, setProfile] = useState({
        name: 'Alex Johnson',
        email: 'alex.johnson@azora.edu',
        studentId: 'AZR-2024-001',
        major: 'Computer Science',
        year: 'Junior',
        gpa: '3.8',
        avatar: '👤',
        bio: 'Passionate about AI and blockchain technology. Ubuntu philosophy advocate.',
        location: 'Johannesburg, South Africa',
        joinedDate: 'September 2023'
    });

    const [isEditing, setIsEditing] = useState(false);
    const [editedProfile, setEditedProfile] = useState(profile);
    const ubuntuServices = useUbuntuServices();

    const handleSave = async () => {
        try {
            // Publish profile update event
            await ubuntuServices.events.publishEvent('profile.updated', {
                userId: 'demo-student-001',
                changes: editedProfile,
                timestamp: new Date().toISOString()
            }, 'azora-sapiens');

            setProfile(editedProfile);
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    const handleCancel = () => {
        setEditedProfile(profile);
        setIsEditing(false);
    };

    return (
        <AppLayout
            headerActions={
                <div className="flex gap-2">
                    {!isEditing ? (
                        <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                    ) : (
                        <>
                            <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                            <Button onClick={handleSave}>Save Changes</Button>
                        </>
                    )}
                </div>
            }
        >
            <div className="max-w-5xl mx-auto py-8">
                {/* Hero */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-bold mb-2">
                        <GradientText>My Profile</GradientText>
                    </h1>
                    <p className="text-muted-foreground">Manage your personal information and settings</p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile Card */}
                    <div className="lg:col-span-1">
                        <AccessibleCard className="glass-card p-6 text-center">
                            <div className="text-8xl mb-4">{profile.avatar}</div>
                            <h2 className="text-2xl font-bold mb-1">{profile.name}</h2>
                            <p className="text-muted-foreground mb-4">{profile.studentId}</p>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Major:</span>
                                    <span className="font-semibold">{profile.major}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Year:</span>
                                    <span className="font-semibold">{profile.year}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">GPA:</span>
                                    <span className="font-semibold">{profile.gpa}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Joined:</span>
                                    <span className="font-semibold">{profile.joinedDate}</span>
                                </div>
                            </div>
                        </AccessibleCard>

                        {/* Ubuntu Philosophy */}
                        <AccessibleCard className="glass-card p-6 mt-6">
                            <h3 className="text-lg font-bold mb-2">🤝 Ubuntu Philosophy</h3>
                            <p className="text-sm text-muted-foreground italic mb-2">
                                "Ngiyakwazi ngoba sikwazi"
                            </p>
                            <p className="text-sm text-muted-foreground">
                                "I can because we can" - Your success multiplies through community benefit.
                            </p>
                        </AccessibleCard>
                    </div>

                    {/* Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Personal Information */}
                        <AccessibleCard className="glass-card p-6">
                            <h3 className="text-xl font-bold mb-4">Personal Information</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Full Name</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editedProfile.name}
                                            onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    ) : (
                                        <p className="text-foreground">{profile.name}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Email</label>
                                    {isEditing ? (
                                        <input
                                            type="email"
                                            value={editedProfile.email}
                                            onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    ) : (
                                        <p className="text-foreground">{profile.email}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Location</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editedProfile.location}
                                            onChange={(e) => setEditedProfile({ ...editedProfile, location: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    ) : (
                                        <p className="text-foreground">{profile.location}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Bio</label>
                                    {isEditing ? (
                                        <textarea
                                            value={editedProfile.bio}
                                            onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                                            rows={3}
                                            className="w-full px-4 py-2 rounded-lg bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    ) : (
                                        <p className="text-foreground">{profile.bio}</p>
                                    )}
                                </div>
                            </div>
                        </AccessibleCard>

                        {/* Academic Information */}
                        <AccessibleCard className="glass-card p-6">
                            <h3 className="text-xl font-bold mb-4">Academic Information</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Major</label>
                                    <p className="text-foreground">{profile.major}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Year</label>
                                    <p className="text-foreground">{profile.year}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Student ID</label>
                                    <p className="text-foreground">{profile.studentId}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">GPA</label>
                                    <p className="text-foreground">{profile.gpa}</p>
                                </div>
                            </div>
                        </AccessibleCard>

                        {/* Privacy & Data Control */}
                        <AccessibleCard className="glass-card p-6">
                            <h3 className="text-xl font-bold mb-4">🔒 Privacy & Data Control</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                As per the Azora Constitution, you have full sovereignty over your data.
                            </p>
                            <div className="space-y-2">
                                <Button variant="outline" className="w-full justify-start">
                                    📥 Download My Data
                                </Button>
                                <Button variant="outline" className="w-full justify-start">
                                    🗑️ Delete My Account
                                </Button>
                                <Button variant="outline" className="w-full justify-start">
                                    📜 View Privacy Policy
                                </Button>
                            </div>
                        </AccessibleCard>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
