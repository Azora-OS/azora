import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, CheckCircle } from 'lucide-react';
import { PremiumButton } from './PremiumButton';

interface ApplicationModalProps {
    isOpen: boolean;
    onClose: () => void;
    jobTitle: string;
    companyName: string;
    onSubmit: (data: any) => void;
}

export function ApplicationModal({ isOpen, onClose, jobTitle, companyName, onSubmit }: ApplicationModalProps) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        resume: null as File | null,
        coverLetter: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStep(2); // Show success state
        setTimeout(() => {
            onSubmit(formData);
        }, 2000);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-[#1e293b] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
                >
                    {step === 1 ? (
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-white">Apply for {jobTitle}</h2>
                                    <p className="text-sm text-blue-200">at {companyName}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-blue-200 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="John Doe"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-blue-200 mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="john@example.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-blue-200 mb-1">Resume / CV</label>
                                    <div className="border-2 border-dashed border-white/10 rounded-lg p-6 text-center hover:bg-white/5 transition-colors cursor-pointer">
                                        <Upload className="mx-auto text-blue-400 mb-2" size={24} />
                                        <p className="text-sm text-blue-200">Click to upload or drag and drop</p>
                                        <p className="text-xs text-gray-500 mt-1">PDF, DOCX up to 5MB</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-blue-200 mb-1">Cover Letter (Optional)</label>
                                    <textarea
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors h-24 resize-none"
                                        value={formData.coverLetter}
                                        onChange={e => setFormData({ ...formData, coverLetter: e.target.value })}
                                        placeholder="Tell us why you're a great fit..."
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <PremiumButton
                                    type="button"
                                    variant="outline"
                                    className="flex-1 justify-center"
                                    onClick={onClose}
                                >
                                    Cancel
                                </PremiumButton>
                                <PremiumButton
                                    type="submit"
                                    className="flex-1 justify-center"
                                >
                                    Submit Application
                                </PremiumButton>
                            </div>
                        </form>
                    ) : (
                        <div className="p-12 text-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
                            >
                                <CheckCircle className="text-green-400" size={40} />
                            </motion.div>
                            <h2 className="text-2xl font-bold text-white mb-2">Application Sent!</h2>
                            <p className="text-blue-200 mb-6">
                                Good luck! We've sent a confirmation email to {formData.email}.
                            </p>
                            <p className="text-sm text-gray-500">Redirecting to applications...</p>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
