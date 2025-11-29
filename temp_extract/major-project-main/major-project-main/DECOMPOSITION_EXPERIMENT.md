# Decomposition Reaction Experiment with Bunsen Burner

This document explains how to run and test the decomposition reaction experiment with the Bunsen burner integration.

## Overview

The decomposition reaction experiment allows students to simulate the thermal decomposition of hydrogen peroxide (H₂O₂) into water (H₂O) and oxygen (O₂) using a Bunsen burner as the heat source. The experiment features:

- Interactive 3D Bunsen burner that can be ignited/extinguished
- Physics-based heating system with energy transfer
- Visual decomposition animation with product fragments
- Gas particle emission during the reaction
- Adjustable heating and cooling rates
- Real-time temperature and energy monitoring

## How to Run the Experiment

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Navigate to the decomposition experiment:**
   Open your browser and go to:
   ```
   http://localhost:5173/lab/decomposition-reaction/run
   ```

## Experiment Controls

### Bunsen Burner Controls
- **Ignite/Extinguish Button**: Click to turn the Bunsen burner flame on or off
- **Heating Rate Slider**: Adjust the intensity of heat transfer (0.1x to 3x)

### Vessel Controls
- **Lift/Lower Buttons**: Move the reaction vessel closer to or further from the flame
- **Cooling Rate Slider**: Control how quickly the vessel cools when the flame is off (0.05x to 1x)

### Experiment Data
- **Temperature Display**: Shows the current temperature in Celsius
- **Energy Level**: Displays the energy level as a percentage (0-100%)
- **Molecule State**: Shows the current state of the reactant molecule

### Reset Button
- **Reset Experiment**: Returns the experiment to its initial state

## How the Experiment Works

1. **Setup**: The experiment starts with a reaction vessel containing hydrogen peroxide molecules.

2. **Heating**: When the Bunsen burner is ignited and the vessel is positioned close to the flame:
   - The molecule's energy level increases over time
   - Temperature rises proportionally to the energy level
   - Energy transfer rate depends on the distance from the flame and heating rate setting

3. **Decomposition**: When the energy level reaches 100%:
   - The molecule decomposes into product fragments
   - Gas particles are emitted to simulate oxygen release
   - The original molecule fades out of visibility

4. **Results**: After decomposition, a results panel explains:
   - The chemical equation for the reaction
   - The products formed (water and oxygen)
   - A scientific explanation of the decomposition process

## Technical Implementation

### Components
- **BunsenBurner3D.tsx**: Custom 3D Bunsen burner with physics integration
- **DecompositionExperiment.tsx**: Main experiment component with all controls and logic
- **Cannon.js**: Physics engine for realistic movement and interactions

### Physics Simulation
- **Heating Logic**: Energy transfer based on flame proximity and heating rate
- **Cooling Logic**: Gradual energy loss when flame is off, adjustable cooling rate
- **Product Physics**: Fragmented molecules with realistic scattering physics
- **Gas Particles**: Lightweight particle system for oxygen emission

### Performance Considerations
- Particle pooling to limit memory usage
- Efficient animation loops with requestAnimationFrame
- Physics step limiting to maintain consistent frame rates

## Customization

Instructors can adjust the following parameters in the code:
- `thresholdEnergy`: Energy required for decomposition (line 74 in DecompositionExperiment.tsx)
- Heating and cooling rates via the UI sliders
- Product fragment count (lines 247-248 in DecompositionExperiment.tsx)
- Gas particle count (line 286 in DecompositionExperiment.tsx)

## Troubleshooting

### Common Issues
1. **Physics Engine Not Loading**: Ensure internet connection for CDN-based Cannon.js loading
2. **Controls Not Responding**: Refresh the page to reset the experiment state
3. **Performance Issues**: Reduce particle count or close other browser tabs

### Browser Compatibility
- Modern browsers with WebGL support (Chrome, Firefox, Edge, Safari)
- JavaScript must be enabled

## Mobile Support
- Touch-friendly controls for burner ignition and vessel positioning
- Responsive UI that adapts to different screen sizes