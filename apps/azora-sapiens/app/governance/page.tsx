'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@azora/shared-design/layouts/AppLayout';
import { AccessibleCard, GradientText, Button } from '@azora/shared-design';
import { UbuntuServices, useUbuntuServices } from '@azora/shared-design/lib/ubuntu-services';

export default function GovernancePage() {
  const [proposals, setProposals] = useState<any[]>([]);
  const [userVotes, setUserVotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const ubuntuServices = useUbuntuServices();

  useEffect(() => {
    loadGovernanceData();
  }, []);

  const loadGovernanceData = async () => {
    try {
      setLoading(true);
      
      // Load proposals
      const proposalsData = await ubuntuServices.governance.getProposals();
      setProposals(proposalsData.proposals || []);

    } catch (error) {
      console.error('Error loading governance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (proposalId: string, support: boolean, reason: string) => {
    try {
      await ubuntuServices.governance.voteOnProposal(proposalId, support, reason);
      
      // Refresh proposals
      await loadGovernanceData();
      
      // Add to user votes
      setUserVotes(prev => [...prev, { proposalId, support, timestamp: new Date() }]);
      
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleCreateProposal = async (title: string, description: string, type: string) => {
    try {
      await ubuntuServices.governance.createProposal({
        title,
        description,
        type,
        proposerId: 'demo-student-001'
      });
      
      // Refresh proposals
      await loadGovernanceData();
      
    } catch (error) {
      console.error('Error creating proposal:', error);
    }
  };

  if (loading) {
    return (
      <AppLayout appName="Azora Sapiens" userName="Azora Citizen">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading Ubuntu Governance...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout appName="Azora Sapiens" userName="Azora Citizen">
      <div className="p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold">
            <GradientText>Ubuntu Governance</GradientText>
          </h1>
          <p className="text-gray-400 text-lg">
            "I govern because we decide together" - Participate in community decisions
          </p>
        </motion.div>

        {/* Create Proposal */}
        <AccessibleCard title="Create Ubuntu Proposal" className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Proposal Title
              </label>
              <input
                type="text"
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                placeholder="Enter proposal title..."
                id="proposal-title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white h-32"
                placeholder="Describe your Ubuntu proposal..."
                id="proposal-description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Type
              </label>
              <select
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                id="proposal-type"
              >
                <option value="policy_change">Policy Change</option>
                <option value="fund_allocation">Fund Allocation</option>
                <option value="constitutional_amendment">Constitutional Amendment</option>
                <option value="upgrade">System Upgrade</option>
              </select>
            </div>
            <Button
              onClick={() => {
                const title = (document.getElementById('proposal-title') as HTMLInputElement).value;
                const description = (document.getElementById('proposal-description') as HTMLTextAreaElement).value;
                const type = (document.getElementById('proposal-type') as HTMLSelectElement).value;
                handleCreateProposal(title, description, type);
              }}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Submit Ubuntu Proposal
            </Button>
          </div>
        </AccessibleCard>

        {/* Active Proposals */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Active Proposals</h2>
          
          {proposals.filter(p => p.status === 'active').map((proposal, index) => (
            <motion.div
              key={proposal.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <AccessibleCard className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{proposal.title}</h3>
                    <p className="text-gray-400 mb-4">{proposal.description}</p>
                    
                    {/* Proposal Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-3 bg-green-900 bg-opacity-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-400">{proposal.forVotes}</div>
                        <div className="text-sm text-gray-400">For</div>
                      </div>
                      <div className="text-center p-3 bg-red-900 bg-opacity-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-400">{proposal.againstVotes}</div>
                        <div className="text-sm text-gray-400">Against</div>
                      </div>
                      <div className="text-center p-3 bg-blue-900 bg-opacity-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-400">{proposal.totalVotes}</div>
                        <div className="text-sm text-gray-400">Total</div>
                      </div>
                    </div>

                    {/* Voting Actions */}
                    <div className="space-y-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Your Reason (Ubuntu Principle)
                        </label>
                        <textarea
                          className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white h-20"
                          placeholder="Explain your Ubuntu reasoning..."
                          id={`reason-${proposal.id}`}
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => {
                            const reason = (document.getElementById(`reason-${proposal.id}`) as HTMLTextAreaElement).value;
                            handleVote(proposal.id, true, reason);
                          }}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          Support Ubuntu Proposal
                        </Button>
                        <Button
                          onClick={() => {
                            const reason = (document.getElementById(`reason-${proposal.id}`) as HTMLTextAreaElement).value;
                            handleVote(proposal.id, false, reason);
                          }}
                          variant="outline"
                          className="flex-1"
                        >
                          Request Refinement
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </AccessibleCard>
            </motion.div>
          ))}

          {proposals.filter(p => p.status === 'active').length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="text-6xl mb-4">🗳️</div>
              <h3 className="text-xl font-bold text-white mb-2">
                No Active Proposals
              </h3>
              <p className="text-gray-400 mb-4">
                Be the first to propose a change for the Ubuntu community
              </p>
            </motion.div>
          )}
        </div>

        {/* Your Voting History */}
        {userVotes.length > 0 && (
          <AccessibleCard title="Your Ubuntu Voting History" className="p-6">
            <div className="space-y-2">
              {userVotes.map((vote, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div>
                    <span className="text-white font-medium">Proposal {vote.proposalId}</span>
                    <span className={`ml-2 px-2 py-1 rounded text-sm ${
                      vote.support ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'
                    }`}>
                      {vote.support ? 'Supported' : 'Requested Refinement'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400">
                    {new Date(vote.timestamp).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </AccessibleCard>
        )}
      </div>
    </AppLayout>
  );
}
