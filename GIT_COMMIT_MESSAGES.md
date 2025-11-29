# Git Commit Messages

This file contains the recommended git commit messages for the decomposition reaction experiment implementation, following the project's conventions.

## Suggested Commits

### 1. Core Implementation
```
feat(decomposition): add 3D vessel and molecule physics bodies
- Create molecule with energy/temperature properties
- Implement Cannon.js physics for realistic movement
- Add vessel positioning controls
```

### 2. Bunsen Burner Integration
```
feat(burner): expose ignite/extinguish API on BunsenBurner3D
- Add forwardRef and useImperativeHandle for API exposure
- Implement ignite/extinguish methods with state management
- Add flame position getter for proximity detection
```

### 3. Heating Logic
```
feat(decomposition): implement heating & energy/progress logic
- Add energy transfer based on flame proximity
- Implement temperature mapping from energy
- Create progress bar visualization
```

### 4. Decomposition Animation
```
feat(decomposition): add decomposition animation and product spawn
- Implement molecule breakdown sequence
- Add product fragment physics with scattering
- Create gas particle emission system
```

### 5. Performance Optimization
```
fix(perf): add particle pooling and limit spawn to 50
- Implement particle reuse to prevent memory leaks
- Limit gas particle count to 50 for better performance
- Add proper cleanup for physics bodies
```

### 6. UI Controls
```
feat(decomposition): add UI controls for experiment
- Create burner toggle button with visual feedback
- Add heating/cooling rate sliders
- Implement lift/lower vessel controls
- Add reset experiment functionality
```

### 7. Documentation
```
docs: how to run decomposition experiment locally
- Add comprehensive documentation for experiment usage
- Include manual testing guide
- Document customization options for instructors
```

### 8. Routing Integration
```
feat(decomposition): add route for decomposition experiment
- Register /lab/decomposition-reaction/run route
- Import DecompositionExperiment component
- Maintain existing routing structure
```

## Branch Name
```
feat/decomposition-bunsen-integration
```

These commit messages follow the conventional commit format with:
- Type prefix (feat, fix, docs)
- Scope in parentheses
- Imperative mood description
- Bullet points for detailed changes when needed