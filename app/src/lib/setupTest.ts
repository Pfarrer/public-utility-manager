/** Vitest setup for UI tests: clean up DOM + testing-library between tests. */
import { cleanup } from '@testing-library/svelte';
import { afterEach } from 'vitest';

afterEach(() => {
	cleanup();
});
