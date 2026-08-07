import { defineMain } from "@storybook/react-vite/node";
import tailwindcss from "@tailwindcss/vite";

export default defineMain({
  addons: [
    "@storybook/addon-docs",
    "@storybook/addon-a11y",
    "@storybook/addon-themes",
    "@storybook/addon-links",
    "@storybook/addon-vitest",
  ],
  framework: "@storybook/react-vite",
  stories: ["../../../packages/tribune/src/**/*.stories.@(ts|tsx)"],
  async viteFinal(config) {
    config.plugins = await [tailwindcss(), ...(config.plugins ?? [])];
    return config;
  },
});
