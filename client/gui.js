import { Pane } from 'tweakpane';
import * as EssentialsPlugin from '@tweakpane/plugin-essentials';

function setupGUI (params, title) {
  const gui = new Pane({
    title,
    container: document.querySelector('.sidebar')
  });
  gui.registerPlugin(EssentialsPlugin);

  const saveButton = gui.addButton({ title: 'Save'}).on('click', () => {
    const preset = gui.exportPreset();
    console.log(preset);
  });

  const fpsGraph = generalFolder.addBlade({
    view: 'fpsgraph',
    label: 'fpsgraph',
    lineCount: 2,
  });

  return gui;
}

export default setupGUI;
