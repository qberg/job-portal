import { withThemeByClassName } from "@storybook/addon-themes";
import type { Preview, ReactRenderer } from "@storybook/react";
import "@jp/tribune/styles";

const preview: Preview = {
  decorators: [
    withThemeByClassName<ReactRenderer>({
      defaultTheme: "light",
      themes: {
        dark: "dark",
        light: "",
      },
    }),
  ],
  parameters: {
    backgrounds: { disable: true },
    docs: {
      toc: true,
    },
    layout: "centered",
  },
};

export default preview;
