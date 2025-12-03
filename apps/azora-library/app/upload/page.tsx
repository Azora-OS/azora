'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@azora/shared-design/layouts/AppLayout';
import { AccessibleCard, GradientText, Button } from '@azora/shared-design';
import { useUbuntuServices } from '@azora/shared-design/lib/ubuntu-services';

export default function UploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [metadata, setMetadata] = useState({
        title: '',
        description: '',
        category: '',
        tags: '',
        license: 'CC-BY-SA'
    });
    const ubuntuServices = useUbuntuServices();

    const handleUpload = async () => {
        if (!file) {
            alert('Please select a file');
            return;
        }

        await ubuntuServices.events.publishEvent('library.upload', {
            userId: 'demo-student-001',
            filename: file.name,
            metadata,
            timestamp: new Date().toISOString()
        }, 'azora-library');

        alert('Resource uploaded successfully! (Feature coming soon)');
    };

    return (
        <AppLayout
            headerActions={
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" href="/library">Cancel</Button>
                    <Button size="sm" onClick={handleUpload}>Upload</Button>
                </div>
            }
        >
            <div className="max-w-4xl mx-auto py-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">
                        <GradientText>Upload Resource</GradientText>
                    </h1>
                    <p className="text-muted-foreground">Share knowledge with the community</p>
                </motion.div>

                <div className="space-y-6">
                    <AccessibleCard className="glass-card p-6">
                        <h2 className="text-xl font-bold mb-4">File Upload</h2>
                        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                            <div className="text-6xl mb-4">📁</div>
                            <p className="text-lg font-semibold mb-2">Drag and drop your file here</p>
                            <p className="text-sm text-muted-foreground mb-4">or</p>
                            <input
                                type="file"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                className="hidden"
                                id="file-upload"
                            />
                            <label htmlFor="file-upload">
                                <Button as="span">Browse Files</Button>
                            </label>
                            {file && (
                                <p className="text-sm text-primary mt-4">Selected: {file.name}</p>
                            )}
                        </div>
                    </AccessibleCard>

                    <AccessibleCard className="glass-card p-6">
                        <h2 className="text-xl font-bold mb-4">Resource Details</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Title *</label>
                                <input
                                    type="text"
                                    value={metadata.title}
                                    onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
                                    placeholder="e.g. Calculus II Study Guide"
                                    className="w-full px-4 py-2 rounded-lg bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Description *</label>
                                <textarea
                                    value={metadata.description}
                                    onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
                                    placeholder="Describe the resource..."
                                    rows={4}
                                    className="w-full px-4 py-2 rounded-lg bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Category *</label>
                                    <select
                                        value={metadata.category}
                                        onChange={(e) => setMetadata({ ...metadata, category: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        <option value="">Select category</option>
                                        <option value="textbook">Textbook</option>
                                        <option value="notes">Notes</option>
                                        <option value="video">Video</option>
                                        <option value="paper">Research Paper</option>
                                        <option value="code">Code</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">License</label>
                                    <select
                                        value={metadata.license}
                                        onChange={(e) => setMetadata({ ...metadata, license: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        <option value="CC-BY-SA">CC BY-SA</option>
                                        <option value="CC-BY">CC BY</option>
                                        <option value="CC0">CC0 (Public Domain)</option>
                                        <option value="All-Rights-Reserved">All Rights Reserved</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
                                <input
                                    type="text"
                                    value={metadata.tags}
                                    onChange={(e) => setMetadata({ ...metadata, tags: e.target.value })}
                                    placeholder="e.g. calculus, integration, mathematics"
                                    className="w-full px-4 py-2 rounded-lg bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        </div>
                    </AccessibleCard>

                    <AccessibleCard className="glass-card p-6">
                        <h3 className="text-lg font-bold mb-2">🤝 Ubuntu Philosophy</h3>
                        <p className="text-sm text-muted-foreground">
                            By sharing your knowledge, you contribute to collective learning. Resources you upload help students worldwide access quality education.
                        </p>
                    </AccessibleCard>

                    <Button size="lg" className="w-full" onClick={handleUpload}>
                        📤 Upload Resource
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}
