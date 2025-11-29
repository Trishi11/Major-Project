# Manual Testing Guide for Decomposition Reaction Experiment

This guide provides step-by-step instructions for manually testing the decomposition reaction experiment with Bunsen burner integration.

## Prerequisites

1. Node.js and npm installed
2. Project dependencies installed (`npm install`)
3. Development server running (`npm run dev`)

## Test Scenario 1: Basic Experiment Flow

### Steps:
1. Navigate to `http://localhost:5173/lab/decomposition-reaction/run`
2. Observe the initial state:
   - Bunsen burner is off (black indicator)
   - Temperature shows 25°C
   - Energy level shows 0%
   - Molecule state shows "stable"

3. Click the "Ignite Burner" button:
   - Bunsen burner should turn blue
   - Indicator should change to "🔥 Blue Flame Active"

4. Observe the controls panel:
   - All controls should be visible and functional
   - Heating rate slider should be adjustable
   - Lift/Lower buttons should be clickable

5. Verify data displays:
   - Temperature, energy level, and molecule state should be visible
   - Safety notes should be accessible

## Test Scenario 2: Heating and Decomposition

### Steps:
1. Ensure the Bunsen burner is ignited
2. Click the "Lift" button several times to position the vessel closer to the flame
3. Observe the energy level:
   - Energy level should gradually increase
   - Temperature should rise proportionally
   - Progress bar should fill

4. Continue heating until energy reaches 100%:
   - Molecule should begin to decompose
   - Original molecule should fade out
   - Product fragments should appear and scatter
   - Gas particles should emit and rise

5. Observe the results modal:
   - Should automatically appear after decomposition
   - Should display reaction details and products
   - Should have "Continue Experiment" and "Reset Experiment" buttons

## Test Scenario 3: Partial Decomposition

### Steps:
1. Reset the experiment using the "Reset" button in the header
2. Ignite the burner and begin heating
3. Before reaching 100% energy, click "Extinguish Burner"
4. Observe:
   - Energy level should stop increasing
   - Energy should gradually decrease (cooling)
   - No decomposition should occur
   - Molecule should remain stable

## Test Scenario 4: Control Adjustments

### Steps:
1. Reset the experiment
2. Adjust the heating rate slider to maximum (3x)
3. Ignite the burner and lift the vessel
4. Observe:
   - Energy should increase more rapidly
   - Temperature should rise faster

5. Extinguish the burner
6. Adjust the cooling rate slider to maximum (1x)
7. Observe:
   - Energy should decrease more rapidly when burner is off

## Test Scenario 5: Mobile Responsiveness

### Steps:
1. Open the experiment in a mobile browser or responsive dev tools
2. Verify:
   - All controls are accessible via touch
   - UI elements resize appropriately
   - Bunsen burner can be ignited via touch
   - Vessel can be lifted/lowered via touch buttons

## Expected Behaviors

### During Heating:
- Energy increases at a rate proportional to flame proximity
- Temperature increases as energy increases
- Molecule state remains "stable" until threshold reached

### At Decomposition Threshold:
- Molecule state changes to "decomposing"
- Original molecule fades out
- 2-3 product fragments appear and scatter with physics
- Gas particles emit and rise upward
- Results modal appears automatically

### During Cooling:
- Energy decreases gradually when burner is off
- Temperature decreases as energy decreases
- Molecule state remains "stable" if decomposition hasn't occurred

### After Reset:
- All values return to initial state
- Bunsen burner is extinguished
- All products and particles are cleared
- Molecule reappears in stable state

## Troubleshooting

### If Bunsen Burner Won't Ignite:
1. Check browser console for JavaScript errors
2. Verify internet connection (Cannon.js loads from CDN)
3. Refresh the page

### If Physics Seems Off:
1. Check browser console for physics engine errors
2. Verify all dependencies are loaded
3. Try a different browser

### If Performance is Poor:
1. Reduce browser zoom level
2. Close other tabs/applications
3. Check for browser extensions that might interfere

### If UI Elements Are Misaligned:
1. Check browser zoom level (should be 100%)
2. Clear browser cache and refresh
3. Try a different browser

## Success Criteria

The experiment is working correctly if:
- [ ] Bunsen burner can be ignited and extinguished
- [ ] Energy level increases when burner is on and vessel is close to flame
- [ ] Temperature correlates with energy level
- [ ] Molecule decomposes when energy reaches threshold
- [ ] Product fragments scatter with physics
- [ ] Gas particles emit during decomposition
- [ ] Results modal appears after decomposition
- [ ] Experiment can be reset and restarted
- [ ] All UI controls are functional
- [ ] Mobile touch controls work
- [ ] Performance is smooth (no significant lag)

## Test Environment Notes

- Tested on Chrome, Firefox, Edge, and Safari
- Requires WebGL support
- Works on desktop and mobile devices
- Internet connection required for initial load (Cannon.js CDN)