import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { EXPERIMENTS } from '@/data/experiments';
import Lab3D from '@/components/Lab3D';

export default function ExperimentRunner() {
  const { slug } = useParams<{ slug: string }>();
  const [experiment, setExperiment] = useState<any>(null);

  useEffect(() => {
    if (slug) {
      // load by slug — either from local JSON or API
      const found = EXPERIMENTS.find(e => e.id === slug);
      setExperiment(found);
    }
  }, [slug]);

  if (!experiment) return <div>Loading experiment: {slug}...</div>;

  return (
    <div>
      <Lab3D experiment={experiment} />
    </div>
  );
}