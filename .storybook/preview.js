import React from "react";
import { addDecorator, addParameters } from "@storybook/react"
import { ChakraProvider } from "@chakra-ui/react";

addParameters({
  actions: {
    argTypesRegex: '^on.*'
  },
})

addDecorator((Story) => (
  <ChakraProvider resetCSS>
    <Story />
  </ChakraProvider>
));