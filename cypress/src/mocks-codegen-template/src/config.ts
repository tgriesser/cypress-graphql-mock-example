import * as documents from './documents.handlebars';
import tsCodegenConfig from 'graphql-codegen-typescript-template';

import { EInputType, GeneratorConfig } from 'graphql-codegen-core';

export const config: GeneratorConfig = {
  ...tsCodegenConfig,
  inputType: EInputType.SINGLE_FILE, // The type of the templates input (and output): either one file or multiple files
  templates: {
    ...(tsCodegenConfig.templates as object),
    // declare here your templates and partials
    documents,
  },
  outFile: 'mock-types.ts', // default output file name
};
