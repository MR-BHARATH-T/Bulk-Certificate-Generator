import { useState, useEffect } from 'react';
import { api } from '../services/api';

export function useJob(jobId) {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!jobId) return;
    
    let interval;
    
    const fetchJob = async () => {
      try {
        const data = await api.getJob(jobId);
        setJob(data);
        setLoading(false);
        
        // Stop polling if in a terminal state
        if (['COMPLETED', 'PARTIALLY_COMPLETED', 'FAILED'].includes(data.status)) {
          if (interval) clearInterval(interval);
        }
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to fetch job');
        setLoading(false);
      }
    };
    
    fetchJob();
    interval = setInterval(fetchJob, 3000); // poll every 3 seconds
    
    return () => clearInterval(interval);
  }, [jobId]);
  
  return { job, loading, error };
}
