import { setProjectAnnotations } from "@storybook/react-vite";
import { beforeAll } from "vitest";
import preview from "./preview";

// Applies preview decorators/params (theme, tribune styles) to story-tests.
const project = setProjectAnnotations([preview]);

beforeAll(project.beforeAll);
