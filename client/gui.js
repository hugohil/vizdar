import { Pane } from 'tweakpane';
import * as EssentialsPlugin from '@tweakpane/plugin-essentials';

function setupGUI (params) {
  const pane = new Pane({ title: 'opts' });
  pane.registerPlugin(EssentialsPlugin);

  let preset = localStorage.getItem('preset');
  try {
    pane.importPreset(JSON.parse(preset));
  } catch (ignore) {}

  const saveButton = pane.addButton({ title: 'Save'}).on('click', () => {
    preset = pane.exportPreset();
    localStorage.setItem('preset', JSON.stringify(preset));
  });

  const fpsGraph = pane.addBlade({
    view: 'fpsgraph',
    label: 'fpsgraph',
    lineCount: 2,
  });

  pane.addInput(params, 'threshold', { min: 0, max: 255 });
  pane.addInput(params, 'blobRadius', { min: 0, max: 100 });

  pane.addButton({ title: 'add exclusion zone' }).on('click', () => {
    const index = Object.keys(params.exclusionZones).length;
    const folder = pane.addFolder({ title: `exclusion zone ${index + 1}` });
    params.exclusionZones[`zone-${index}`] = {
      pos: { x: 0, y: 0 },
      dim: { x: 0.1, y: 0.1 },
      debug: true,
    };
    folder.addInput(params.exclusionZones[`zone-${index}`], 'pos', {
      x: { min: -1, max: 1, step: 0.01 },
      y: { min: -1, max: 1, step: 0.01 },
    });
    folder.addInput(params.exclusionZones[`zone-${index}`], 'dim', {
      x: { min: 0, max: 1, step: 0.01 },
      y: { min: 0, max: 1, step: 0.01 },
    });
    folder.addInput(params.exclusionZones[`zone-${index}`], 'debug');
    folder.addButton({ title: 'remove' }).on('click', () => {
      delete params.exclusionZones[`zone-${index}`];
      folder.dispose();
    });
  });

  return { pane, fpsGraph, preset };
}

export default setupGUI;
