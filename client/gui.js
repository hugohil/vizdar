import { Pane } from 'tweakpane';
import * as EssentialsPlugin from '@tweakpane/plugin-essentials';

function setupGUI (params, canvas) {
  const pane = new Pane({
    title: 'opts',
    container: document.querySelector('.sidebar')
  });
  pane.registerPlugin(EssentialsPlugin);

  let preset = localStorage.getItem('vizdar-preset');
  try {
    const p = JSON.parse(preset);

    pane.importPreset(p);
  } catch (ignore) {}

  const saveButton = pane.addButton({ title: 'Save'}).on('click', () => {
    preset = pane.exportPreset();
    localStorage.setItem('vizdar-preset', JSON.stringify(preset));
  });

  const generalFolder = pane.addFolder({ title: 'general' });
  const devicesFolder = pane.addFolder({ title: 'devices' });
  const activeFolder = pane.addFolder({ title: 'activation zone' });

  const fpsGraph = generalFolder.addBlade({
    view: 'fpsgraph',
    label: 'fpsgraph',
    lineCount: 2,
  });

  generalFolder.addInput(params, 'brightness', { min: 0, max: 255 });
  generalFolder.addInput(params, 'distance', { min: 0, max: 100 });
  generalFolder.addInput(params, 'minSize', { min: 0, max: 500 });
  generalFolder.addInput(params, 'lifespan', { min: 0, max: 10, step: 0.1 });

  activeFolder.addInput(params.activeZone, 'x', {
    min: 0, max: canvas.width, step: 0.01, presetKey: `active-zone-x`
  });
  activeFolder.addInput(params.activeZone, 'y', {
    min: 0, max: canvas.height, step: 0.01, presetKey: `active-zone-y `
  });
  activeFolder.addInput(params.activeZone, 'width', {
    min: 0, max: canvas.width, step: 0.01, presetKey: `active-zone-width`
  });
  activeFolder.addInput(params.activeZone, 'height', {
    min: 0, max: canvas.height, step: 0.01, presetKey: `active-zone-height`
  });

  return { pane, devicesFolder, fpsGraph, preset };
}

export default setupGUI;
