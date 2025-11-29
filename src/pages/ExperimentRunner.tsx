import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ALL_EXPERIMENTS } from '@/lab/data/experiments';
import Lab3D from '@/components/Lab3D';

export default function ExperimentRunner() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [experiment, setExperiment] = useState<any>(null);

  useEffect(() => {
    if (slug) {
      // load by slug — either from local JSON or API
      const found = ALL_EXPERIMENTS.find(e => e.id === slug);
      setExperiment(found);
    }
  }, [slug]);

  if (!experiment) return <div>Loading experiment: {slug}...</div>;

  return (
    <div>
      <Lab3D experiment={experiment} onBack={() => navigate('/lab')} />
    </div>
  );
}