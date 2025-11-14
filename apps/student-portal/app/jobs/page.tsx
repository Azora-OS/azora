'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api-provider';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/header';
import { Briefcase, MapPin, DollarSign, Clock, Search, TrendingUp, Award } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export default function JobsPage() {
  const api = useApi();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: jobs, isLoading } = useQuery({
    queryKey: ['jobs', search],
    queryFn: async () => {
      const response: any = await api.marketplace.getJobs(search ? { search } : undefined);
      return response?.data || [];
    }
  });

  const applyMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const response: any = await api.marketplace.applyToJob(jobId, user?.id);
      return response?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast({ title: 'Application submitted!', description: 'The employer will review your profile.' });
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 rounded-full px-4 py-2 mb-4">
            <TrendingUp className="h-4 w-4 text-teal-400" />
            <span className="text-sm text-teal-400 font-medium">Ubuntu Marketplace</span>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            Find Your <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">Dream Opportunity</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Connect with opportunities that multiply your sovereignty and enable collective prosperity
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search jobs, skills, or companies..."
              className="w-full h-14 pl-14 pr-6 bg-slate-900/50 backdrop-blur-xl border-slate-800/50 text-white placeholder:text-slate-500 rounded-2xl focus:ring-2 focus:ring-teal-500/50"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-slate-900/30 backdrop-blur-xl border-slate-800/50 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{jobs?.length || 0}</div>
                <div className="text-sm text-slate-400">Active Jobs</div>
              </div>
            </div>
          </Card>
          
          <Card className="bg-slate-900/30 backdrop-blur-xl border-slate-800/50 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">95%</div>
                <div className="text-sm text-slate-400">Match Rate</div>
              </div>
            </div>
          </Card>
          
          <Card className="bg-slate-900/30 backdrop-blur-xl border-slate-800/50 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">$75K</div>
                <div className="text-sm text-slate-400">Avg Salary</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Job Listings */}
        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="bg-slate-900/30 backdrop-blur-xl border-slate-800/50 p-6 animate-pulse">
                <div className="h-32 bg-slate-800/50 rounded" />
              </Card>
            ))
          ) : jobs?.length > 0 ? (
            jobs.map((job: any) => (
              <Card key={job.id} className="bg-slate-900/30 backdrop-blur-xl border-slate-800/50 hover:border-teal-500/50 transition-all duration-300 group">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-white group-hover:text-teal-400 transition-colors">
                          {job.title}
                        </h3>
                        {job.featured && (
                          <Badge className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white border-0">
                            Featured
                          </Badge>
                        )}
                      </div>
                      <p className="text-slate-400 mb-4">{job.company}</p>
                      <p className="text-slate-300 leading-relaxed">{job.description}</p>
                    </div>
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-slate-800 to-slate-700 flex items-center justify-center text-2xl ml-6">
                      {job.companyLogo || '🏢'}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    <div className="flex items-center gap-2 text-slate-400">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">{job.location || 'Remote'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <DollarSign className="h-4 w-4" />
                      <span className="text-sm">{job.salary || 'Competitive'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">{job.type || 'Full-time'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
                    <div className="flex flex-wrap gap-2">
                      {job.skills?.slice(0, 3).map((skill: string, i: number) => (
                        <Badge key={i} variant="outline" className="border-slate-700 text-slate-300">
                          {skill}
                        </Badge>
                      ))}
                      {job.skills?.length > 3 && (
                        <Badge variant="outline" className="border-slate-700 text-slate-400">
                          +{job.skills.length - 3} more
                        </Badge>
                      )}
                    </div>
                    <Button
                      onClick={() => applyMutation.mutate(job.id)}
                      disabled={applyMutation.isPending || job.applied}
                      className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 rounded-xl shadow-lg shadow-teal-500/25"
                    >
                      {job.applied ? 'Applied' : applyMutation.isPending ? 'Applying...' : 'Apply Now'}
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="bg-slate-900/30 backdrop-blur-xl border-slate-800/50 p-12 text-center">
              <Briefcase className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No jobs found</h3>
              <p className="text-slate-400">Try adjusting your search criteria or check back later for new opportunities.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}und</h3>
              <p className="text-slate-400">Try adjusting your search criteria or check back later for new opportunities.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}und</h3>
              <p className="text-slate-400">Try adjusting your search criteria</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
