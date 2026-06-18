import { add } from "./index";

describe("add", () => {
	it("adds two positive numbers", () => {
		expect(add(2, 3)).toBe(5);
	});

	it("handles negative numbers", () => {
		expect(add(-4, 1)).toBe(-3);
	});
});
