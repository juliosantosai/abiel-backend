import "@testing-library/jest-dom";
import matchMediaPolyfill from "mq-polyfill";
import "whatwg-fetch";
import { vi } from "vitest";

matchMediaPolyfill(window);

afterEach(() => {
  vi.restoreAllMocks();
});
