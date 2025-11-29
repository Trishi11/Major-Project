import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EXPERIMENTS } from '@/lab/data/experiments';
import Lab3D from '@/components/Lab3D';

const PermanganateReductionExperiment = () => {
  const navigate = useNavigate();
  const [experiment, setExperiment] = useState<any>(null);

  useEffect(() => {
    // Find the permanganate reduction experiment directly
    const foundExperiment = EXPERIMENTS.find(exp => exp.id === 'permanganate-reduction');
    if (foundExperiment) {
      setExperiment(foundExperiment);
    } else {
      // Handle experiment not found
      navigate('/lab');
    }
  }, [navigate]);

  const handleBack = () => {
    navigate('/lab');
  };

  if (!experiment) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="text-xl text-foreground/60 animate-pulse">Loading experiment...</div>
      </div>
    );
  }

  // Convert lab experiment to Lab3D compatible format
  const lab3DExperiment = {
    ...experiment,
    chemicals: experiment.reactions?.flatMap(reaction => 
      [...reaction.reactants, ...reaction.products]
        .filter((v, i, a) => a.indexOf(v) === i) // Remove duplicates
        .map(id => ({
          id,
          name: id.toUpperCase(),
          formula: id.toUpperCase(),
          color: '#FFFFFF',
          properties: {
            state: 'liquid' as const,
            color: '#FFFFFF',
            density: 1.0,
            boilingPoint: 100,
            meltingPoint: 0,
            solubility: 100,
            reactivity: []
          }
        }))
    ) || []
  };

  return (
    <Lab3D 
      experiment={lab3DExperiment} 
      onBack={handleBack}
    />
  );
};

export default PermanganateReductionExperiment;