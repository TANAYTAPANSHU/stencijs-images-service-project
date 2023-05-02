import { Config } from '@stencil/core';
import {sass} from '@stencil/sass'

export const config: Config = {
  namespace: 'stencil-proj',
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'dist-custom-elements',
    },
    {
      type: 'docs-readme',
    },
    {
      type: 'www',
      serviceWorker: null, // disable service workers
    },
  ],
  plugins :[
    sass()
  ]
};
