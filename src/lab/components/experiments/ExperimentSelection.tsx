import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ALL_EXPERIMENTS } from '@/lab/data/experiments'
import type { Experiment } from '@/lab/types'
import { Play, Book, Search, Filter, X, FlaskConical, TestTube2, Beaker } from 'lucide-react'

const difficultyColors: Record<string, string> = {
  beginner: 'bg-green-500/20 text-green-400 border-green-500/30',
  intermediate: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  advanced: 'bg-red-500/20 text-red-400 border-red-500/30',
}

const categoryIcons: Record<string, string> = {
  'acid-base': '🧪',
  'precipitation': '💎',
  'redox': '⚡',
  'thermal': '🔥',
  'gas-evolution': '💨',
  'crystallization': '❄️',
}

export default function ExperimentSelection() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)

  // Filter experiments based on search and filters
  const filteredExperiments = ALL_EXPERIMENTS.filter(experiment => {
    const matchesSearch = experiment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         experiment.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDifficulty = selectedDifficulty === 'all' || experiment.difficulty === selectedDifficulty
    const matchesCategory = selectedCategory === 'all' || experiment.category === selectedCategory
    
    return matchesSearch && matchesDifficulty && matchesCategory
  })

  const handleStartExperiment = (experimentId: string) => {
    // Map common experiment titles to their correct IDs
    const experimentIdMap: Record<string, string> = {
      'Neutralization Reaction': 'neutralization-reaction',
      'Precipitation Reaction': 'precipitation-reaction',
      'Displacement Reaction': 'displacement-reaction',
      'Reduction Reaction': 'reduction-reaction',
      'Decomposition Reaction': 'decomposition-reaction',
      'Acid-Base Indicator Reaction': 'acid-base-indicator'
    };
    
    // If the experimentId looks like a title, map it to the correct ID
    const mappedId = experimentIdMap[experimentId] || experimentId;
    navigate(`/lab/${mappedId}/run`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Virtual Chemistry Lab</h1>
              <p className="text-sm text-muted-foreground">Select an experiment to begin</p>
            </div>
            <button
              onClick={() => navigate('/lab')}
              className="glass-panel border border-border/30 text-foreground px-4 py-2 rounded-lg transition-all hover:bg-accent"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-24 pb-12">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Chemistry Experiments
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Explore interactive 3D chemistry experiments with realistic equipment, 
            chemical reactions, and safety protocols.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 rounded-xl glass-panel border border-border/30">
            <FlaskConical className="mx-auto text-foreground mb-3" size={40} />
            <h3 className="text-2xl font-bold text-foreground">{ALL_EXPERIMENTS.length}</h3>
            <p className="text-muted-foreground">Available Experiments</p>
          </div>
          <div className="p-6 rounded-xl glass-panel border border-border/30">
            <TestTube2 className="mx-auto text-foreground mb-3" size={40} />
            <h3 className="text-2xl font-bold text-foreground">12</h3>
            <p className="text-muted-foreground">Lab Equipment Types</p>
          </div>
          <div className="p-6 rounded-xl glass-panel border border-border/30">
            <Beaker className="mx-auto text-foreground mb-3" size={40} />
            <h3 className="text-2xl font-bold text-foreground">30+</h3>
            <p className="text-muted-foreground">Chemical Compounds</p>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="p-6 rounded-xl glass-panel border border-border/30 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
              <input
                type="text"
                placeholder="Search experiments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-background/50 border border-border/50 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
                showFilters 
                  ? 'bg-primary text-primary-foreground' 
                  : 'glass-panel border border-border/30 hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              <Filter size={20} />
              <span>Filters</span>
            </button>
          </div>
          
          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Difficulty Filter */}
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Difficulty</label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-background/50 border border-border/50 focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="all">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-background/50 border border-border/50 focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="all">All Categories</option>
                  <option value="acid-base">Acid-Base</option>
                  <option value="precipitation">Precipitation</option>
                  <option value="redox">Redox</option>
                  <option value="thermal">Thermal</option>
                  <option value="gas-evolution">Gas Evolution</option>
                  <option value="crystallization">Crystallization</option>
                </select>
              </div>
            </div>
          )}
          
          {/* Results Count */}
          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredExperiments.length} of {ALL_EXPERIMENTS.length} experiments
            {searchTerm && ` for "${searchTerm}"`}
          </div>
        </div>

        {/* Experiments Grid */}
        <div>
          <h3 className="text-2xl font-bold mb-8 flex items-center text-foreground">
            <Book className="mr-3 text-foreground" />
            Available Experiments
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExperiments.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="mb-4 text-muted-foreground">
                  <TestTube2 size={48} className="mx-auto opacity-50" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">No experiments found</h3>
                <p className="text-muted-foreground">
                  {searchTerm 
                    ? `No experiments match "${searchTerm}" with the selected filters.`
                    : 'No experiments match the selected filters.'
                  }
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedDifficulty('all')
                    setSelectedCategory('all')
                  }}
                  className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              filteredExperiments.map((experiment) => (
                <div
                  key={experiment.id}
                  className="rounded-xl overflow-hidden border border-border/30 hover:border-border/50 transition-all duration-300 glass-panel"
                >
                  {/* Header */}
                  <div className="p-6 pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">
                          {categoryIcons[experiment.category] || '🔬'}
                        </span>
                        <div>
                          <h3 className="text-lg font-bold line-clamp-2 text-foreground">
                            {experiment.title}
                          </h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <span 
                              className={`px-2 py-1 rounded-full text-xs font-medium border ${difficultyColors[experiment.difficulty]}`}
                            >
                              {experiment.difficulty}
                            </span>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <span>{experiment.duration}min</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm line-clamp-3 mb-4 text-muted-foreground">
                      {experiment.description}
                    </p>

                    {/* Objectives Preview */}
                    <div className="mb-4">
                      <div className="flex items-center text-sm font-medium mb-2 text-foreground">
                        Learning Objectives
                      </div>
                      <div className="space-y-1">
                        {experiment.objectives.slice(0, 2).map((objective, idx) => (
                          <div key={idx} className="text-xs flex items-start text-muted-foreground">
                            <span className="mr-2 text-foreground">•</span>
                            <span className="line-clamp-1">{objective}</span>
                          </div>
                        ))}
                        {experiment.objectives.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{experiment.objectives.length - 2} more objectives
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Materials Count */}
                    <div className="flex items-center justify-between text-sm mb-4 text-muted-foreground">
                      <div className="flex items-center">
                        <span className="text-xs">
                          {experiment.steps.length} steps
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-xs">
                          {experiment.materials.length} materials needed
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="p-6 pt-0">
                    <button
                      onClick={() => handleStartExperiment(experiment.id)}
                      className="w-full flex items-center justify-center space-x-2 bg-primary text-primary-foreground font-medium py-3 px-4 rounded-lg transition-all duration-200 hover:bg-primary/90"
                    >
                      <Play size={16} />
                      <span>Start Experiment</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}