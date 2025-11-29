const express = require('express');
const router = express.Router();
const experimentController = require('../controllers/experiment.controller');

// Get all experiments
router.get('/', experimentController.getAllExperiments);

// Get experiment by ID
router.get('/:id', experimentController.getExperimentById);

// Create new experiment
router.post('/', experimentController.createExperiment);

// Update experiment
router.put('/:id', experimentController.updateExperiment);

// Delete experiment
router.delete('/:id', experimentController.deleteExperiment);

module.exports = router;