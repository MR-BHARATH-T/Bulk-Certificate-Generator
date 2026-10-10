import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Loader2, Plus, Users } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    event_name: '',
    organization_name: '',
    issue_date: new Date().toISOString().split('T')[0],
    description: '',
    recipients_text: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Parse CSV/text into recipients array
      const lines = formData.recipients_text.split('\n').filter(l => l.trim());
      const recipients = lines.map(line => {
        const parts = line.split(',');
        return {
          full_name: parts[0]?.trim() || '',
          email: parts[1]?.trim() || null
        };
      }).filter(r => r.full_name); // basic validation
      
      if (recipients.length === 0) {
        throw new Error("Please provide at least one valid recipient name.");
      }

      const jobData = {
        event_name: formData.event_name,
        organization_name: formData.organization_name,
        issue_date: formData.issue_date,
        description: formData.description,
        recipients
      };

      const job = await api.createJob(jobData);
      navigate(`/jobs/${job.id}`);
      
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50">
          <h2 className="text-xl font-semibold text-slate-800">Create New Certificate Batch</h2>
          <p className="text-sm text-slate-500 mt-1">Generate multiple certificates at once from a list of names.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Event/Course Name</label>
              <input 
                required
                name="event_name"
                value={formData.event_name}
                onChange={handleInputChange}
                type="text" 
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                placeholder="e.g. Python Mastery 2026"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Organization Name</label>
              <input 
                required
                name="organization_name"
                value={formData.organization_name}
                onChange={handleInputChange}
                type="text" 
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                placeholder="e.g. Tech Academy"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Issue Date</label>
            <input 
              required
              name="issue_date"
              value={formData.issue_date}
              onChange={handleInputChange}
              type="date" 
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Description (Optional)</label>
            <textarea 
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="2"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              placeholder="e.g. For successfully completing the 40-hour intensive program."
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Users size={16} /> Recipients
            </label>
            <p className="text-xs text-slate-500 mb-2">Enter one recipient per line in format: <code>Full Name, Email (optional)</code></p>
            <textarea 
              required
              name="recipients_text"
              value={formData.recipients_text}
              onChange={handleInputChange}
              rows="6"
              className="w-full font-mono text-sm rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              placeholder={"Alice Smith, alice@example.com\nBob Jones"}
            />
          </div>
          
          <div className="pt-4 flex justify-end">
            <button 
              type="submit" 
              disabled={loading}
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <><Loader2 className="animate-spin mr-2" size={18} /> Processing...</> : <><Plus className="mr-2" size={18} /> Generate Certificates</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Dashboard;
