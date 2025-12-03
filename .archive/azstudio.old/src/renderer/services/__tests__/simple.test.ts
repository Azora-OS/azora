import { MultiAgentRuntime } from '../MultiAgentRuntime';

describe('Simple Test', () => {
    it('should pass', () => {
        const fn = jest.fn();
        fn();
        expect(fn).toHaveBeenCalled();
    });
});
