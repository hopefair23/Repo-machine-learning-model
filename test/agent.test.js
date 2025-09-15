// test/agent.test.js
const Agent = require('../src/agent');

// We need to get a handle on the mock 'execute' function for assertions.
const mockWebSearchExecute = jest.fn().mockResolvedValue('Mocked search results');
const mockCodeExecutorExecute = jest.fn().mockResolvedValue('Mocked code result');

// Mock the tool modules.
// jest.fn().mockImplementation() creates a mock constructor that can be instantiated with 'new'.
jest.mock('../src/tools/webSearch.js', () => {
    return jest.fn().mockImplementation(() => {
        return {
            name: 'web_search',
            description: 'Mocked web search',
            execute: mockWebSearchExecute,
        };
    });
});

jest.mock('../src/tools/codeExecutor.js', () => {
    return jest.fn().mockImplementation(() => {
        return {
            name: 'code_executor',
            description: 'Mocked code executor',
            execute: mockCodeExecutorExecute,
        };
    });
});


describe('Agent', () => {
    let agent;

    beforeEach(() => {
        // Clear mock history before each test.
        jest.clearAllMocks();
        // Create a new agent instance for each test.
        agent = new Agent();
    });

    test('should initialize and load tools correctly', () => {
        const tools = agent.listAvailableTools();
        expect(tools).toHaveLength(2);
        expect(tools.map(t => t.name)).toEqual(expect.arrayContaining(['web_search', 'code_executor']));
    });

    test('should choose and execute code_executor for calculation queries', async () => {
        const response = await agent.processQuery('calculate 2 + 2');
        expect(mockCodeExecutorExecute).toHaveBeenCalledTimes(1);
        expect(mockCodeExecutorExecute).toHaveBeenCalledWith('return 2 + 2;');
        expect(response).toContain('Mocked code result');
    });

    test('should choose and execute web_search for question queries', async () => {
        const response = await agent.processQuery('what is javascript');
        expect(mockWebSearchExecute).toHaveBeenCalledTimes(1);
        expect(mockWebSearchExecute).toHaveBeenCalledWith('javascript');
        expect(response).toContain('Mocked search results');
    });

    test('should not use any tool for conversational queries', async () => {
        const response = await agent.processQuery('hello there');
        expect(mockCodeExecutorExecute).not.toHaveBeenCalled();
        expect(mockWebSearchExecute).not.toHaveBeenCalled();
        expect(response).toContain("I'm sorry, I can't directly answer");
    });
});
