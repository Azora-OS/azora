import React, { useState } from 'react';
import { Rocket, DollarSign } from 'lucide-react';
import { useBusinessesQuery, useCreateBusinessMutation } from '@azora/api-client/react-query-hooks';

export const IncubatorApp: React.FC = () => {
    const { data: businessesData, isLoading: loading } = useBusinessesQuery();
    const createBusinessMutation = useCreateBusinessMutation();
    const [showWizard, setShowWizard] = useState(false);
    const [wizardStep, setWizardStep] = useState(1);
    const [businessData, setBusinessData] = useState({ name: '', type: 'Education', description: '' });

    const businesses = businessesData?.data || [];


    const handleCreateBusiness = async () => {
        try {
            await createBusinessMutation.mutateAsync(businessData);
            setShowWizard(false);
            setBusinessData({ name: '', type: 'Education', description: '' });
        } catch (err) {
            console.error('Failed to create business:', err);
            alert('Failed to create business. Please try again.');
        }
    };

    if (showWizard) {
        return (
            <div className="h-full flex flex-col bg-gradient-to-br from-slate-900 via-blue-950/20 to-slate-900">
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-white">Business Creation Wizard</h2>
                        <button onClick={() => setShowWizard(false)} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors">Cancel</button>
                    </div>
                    <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5, 6].map(step => (
                            <div key={step} className="flex-1">
                                <div className={`h-2 rounded-full transition-all ${step <= wizardStep ? 'bg-purple-500' : 'bg-white/10'}`} />
                                <p className="text-xs text-white/40 mt-1">Step {step}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-2xl mx-auto space-y-6">
                        <div>
                            <h3 className="text-xl font-semibold text-white mb-2">Business Information</h3>
                            <p className="text-white/60">Tell us about your business idea</p>
                        </div>
                        <div>
                            <label className="block text-sm text-white/60 mb-2">Business Name</label>
                            <input type="text" value={businessData.name} onChange={(e) => setBusinessData({ ...businessData, name: e.target.value })} placeholder="Enter business name" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50" />
                        </div>
                        <div>
                            <label className="block text-sm text-white/60 mb-2">Business Type</label>
                            <select value={businessData.type} onChange={(e) => setBusinessData({ ...businessData, type: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50">
                                <option>Education</option>
                                <option>Technology</option>
                                <option>Consulting</option>
                                <option>Creative</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-white/60 mb-2">Description</label>
                            <textarea value={businessData.description} onChange={(e) => setBusinessData({ ...businessData, description: e.target.value })} rows={4} placeholder="Describe your business..." className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50" />
                        </div>
                        <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-6">
                            <div className="flex items-start gap-3">
                                <div className="p-3 bg-purple-500/20 rounded-lg"><Rocket className="text-purple-400" size={24} /></div>
                                <div>
                                    <h4 className="text-white font-semibold mb-2">Elara's Guidance</h4>
                                    <p className="text-sm text-white/60">Great start! A clear business name and description will help you attract the right customers. Remember, Ubuntu philosophy means your success contributes to the community through the Citadel Fund.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-6 border-t border-white/10 bg-white/5">
                    <div className="flex items-center justify-between max-w-2xl mx-auto">
                        <button onClick={() => setWizardStep(Math.max(1, wizardStep - 1))} disabled={wizardStep === 1} className="px-6 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white transition-colors">Previous</button>
                        <button onClick={() => wizardStep === 6 ? handleCreateBusiness() : setWizardStep(Math.min(6, wizardStep + 1))} className="px-6 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-white transition-colors">
                            {wizardStep === 6 ? 'Launch Business' : 'Next Step'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-gradient-to-br from-slate-900 via-blue-950/20 to-slate-900">
            <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-2">Elara Incubator</h1>
                        <p className="text-white/60">AI-powered business creation and acceleration</p>
                    </div>
                    <button onClick={() => setShowWizard(true)} className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-white transition-colors">
                        <Rocket size={18} />
                        <span>Create Business</span>
                    </button>
                </div>
                <div className="grid grid-cols-4 gap-4">
                    <div className="bg-white/5 rounded-lg p-4">
                        <p className="text-xs text-white/40 mb-1">Active Businesses</p>
                        <p className="text-2xl font-bold text-white">{businesses.filter(b => b.status === 'active').length}</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                        <p className="text-xs text-white/40 mb-1">Total Revenue</p>
                        <p className="text-2xl font-bold text-white">${businesses.reduce((sum, b) => sum + b.revenue, 0).toFixed(2)}</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                        <p className="text-xs text-white/40 mb-1">Your Share (90%)</p>
                        <p className="text-2xl font-bold text-green-400">${(businesses.reduce((sum, b) => sum + b.revenue, 0) * 0.9).toFixed(2)}</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                        <p className="text-xs text-white/40 mb-1">Citadel Fund (10%)</p>
                        <p className="text-2xl font-bold text-yellow-400">${businesses.reduce((sum, b) => sum + b.citadelContribution, 0).toFixed(2)}</p>
                    </div>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
                {businesses.length === 0 ? (
                    <div className="text-center py-12">
                        <Rocket className="w-16 h-16 text-white/20 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">No businesses yet</h3>
                        <p className="text-white/60 mb-6">Start your entrepreneurial journey with Elara's guidance</p>
                        <button onClick={() => setShowWizard(true)} className="px-6 py-3 bg-purple-500 hover:bg-purple-600 rounded-lg text-white transition-colors">Create Your First Business</button>
                    </div>
                ) : (
                    <div>
                        <h2 className="text-xl font-semibold text-white mb-4">Your Businesses</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {businesses.map(business => (
                                <div key={business.id} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-white mb-1">{business.name}</h3>
                                            <p className="text-sm text-white/60">{business.type}</p>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${business.status === 'active' ? 'bg-green-500/20 text-green-400' : business.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/10 text-white/60'}`}>
                                            {business.status}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="bg-white/5 rounded-lg p-3">
                                            <p className="text-xs text-white/40 mb-1">Total Revenue</p>
                                            <p className="text-xl font-bold text-white">${business.revenue.toFixed(2)}</p>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-3">
                                            <p className="text-xs text-white/40 mb-1">Citadel (10%)</p>
                                            <p className="text-xl font-bold text-green-400">${business.citadelContribution.toFixed(2)}</p>
                                        </div>
                                    </div>
                                    <button className="w-full py-2 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-lg transition-colors">Manage Business</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                <div className="mt-8 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-3">90/10 Revenue Model</h3>
                    <p className="text-white/60 mb-4">Keep 90% of your revenue while 10% goes to the Citadel Fund, supporting scholarships and community projects. Your success helps others succeed - that's Ubuntu.</p>
                    <p className="text-sm text-white/40 italic">"Ngiyakwazi ngoba sikwazi" - I can because we can</p>
                </div>
            </div>
        </div>
    );
};
