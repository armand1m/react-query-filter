import React from "react";
import { addDecorator, addParameters } from "@storybook/react"
import { ChakraProvider } from "@chakra-ui/react";

addParameters({
  actions: {
    argTypesRegex: '^on.*'
  },
  docs: {
    extractComponentDescription: (component, { notes }) => {
      if (notes) {
        return typeof notes === 'string' ? notes : notes.markdown || notes.text;
      }
      return null;
    },
  },
});

addDecorator((Story) => (
  <ChakraProvider resetCSS>
    <Story />
  </ChakraProvider>
));
