const Experiment = require('../models/Experiment');

// Get all experiments
const getAllExperiments = async (req, res) => {
  try {
    const experiments = await Experiment.find().sort({ createdAt: -1 });
    res.json(experiments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get experiment by ID
const getExperimentById = async (req, res) => {
  try {
    const experiment = await Experiment.findById(req.params.id);
    if (!experiment) {
      return res.status(404).json({ message: 'Experiment not found' });
    }
    res.json(experiment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new experiment
const createExperiment = async (req, res) => {
  try {
    const { title, description, chemicals, procedure, safetyNotes } = req.body;
    
    const experiment = new Experiment({
      title,
      description,
      chemicals,
      procedure,
      safetyNotes
    });
    
    await experiment.save();
    res.status(201).json(experiment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update experiment
const updateExperiment = async (req, res) => {
  try {
    const { title, description, chemicals, procedure, safetyNotes } = req.body;
    
    const experiment = await Experiment.findByIdAndUpdate(
      req.params.id,
      { title, description, chemicals, procedure, safetyNotes },
      { new: true }
    );
    
    if (!experiment) {
      return res.status(404).json({ message: 'Experiment not found' });
    }
    
    res.json(experiment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete experiment
const deleteExperiment = async (req, res) => {
  try {
    const experiment = await Experiment.findByIdAndDelete(req.params.id);
    
    if (!experiment) {
      return res.status(404).json({ message: 'Experiment not found' });
    }
    
    res.json({ message: 'Experiment deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllExperiments,
  getExperimentById,
  createExperiment,
  updateExperiment,
  deleteExperiment
};