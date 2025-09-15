const ToolManager = require('./toolManager');

class Agent {
    constructor() {
        console.log("Agent initialized.");
        this.toolManager = new ToolManager();
        this.toolManager.loadToolsFrom('tools'); // Load tools from the 'src/tools' directory
        console.log("Available tools:", this.toolManager.listTools());
    }

    async processQuery(query) {
        console.log(`\nProcessing query: "${query}"`);

        // 1. Create a prompt for the LLM (for demonstration purposes).
        const toolList = this.toolManager.listTools();
        const formattedTools = toolList.map(t => `  - ${t.name}: ${t.description}`).join('\n');
        const prompt = `
You are an AI agent. Your goal is to answer the user's query by selecting the best tool.
You have access to the following tools:
${formattedTools}

User query: "${query}"

Based on the query, which tool should be used?
Respond with a JSON object in the format: {"tool": "tool_name", "args": {"arg_name": "value"}}
or {"tool": null, "answer": "direct_answer"} if no tool is needed.
`;
        // console.log("--- LLM PROMPT (SIMULATED) ---");
        // console.log(prompt); // This is very verbose for the output log.

        // 2. Simulate the LLM's decision-making process.
        // In a real application, this would be an API call to an LLM.
        let llmResponse;
        const lowerQuery = query.toLowerCase();

        if (lowerQuery.includes('calculate') || lowerQuery.match(/\d+\s*[\+\-\*\/]\s*\d+/)) {
            const codeToExecute = lowerQuery.replace(/calculate/i, '').trim();
            llmResponse = {
                thought: "The user wants to perform a calculation. The `code_executor` tool is perfect for this.",
                tool: "code_executor",
                args: { code: `return ${codeToExecute};` }
            };
        } else if (lowerQuery.includes('search for') || lowerQuery.includes('find') || lowerQuery.includes('who is') || lowerQuery.includes('what is')) {
            const searchQuery = lowerQuery.replace(/search for|find|who is|what is/i, '').trim();
            llmResponse = {
                thought: "The user is asking a question or wants to search for something. I should use the `web_search` tool.",
                tool: "web_search",
                args: { query: searchQuery }
            };
        } else {
            llmResponse = {
                thought: "I don't have a specific tool for this query. I will try to answer directly.",
                tool: null,
                answer: `I'm sorry, I can't directly answer "${query}" yet. My capabilities are still under development.`
            };
        }
        console.log("--- LLM RESPONSE (SIMULATED) ---");
        console.log(JSON.stringify(llmResponse, null, 2));

        // 3. Execute the tool based on the simulated response.
        if (llmResponse.tool) {
            const tool = this.toolManager.getTool(llmResponse.tool);
            if (tool) {
                const toolArgs = Object.values(llmResponse.args);
                const result = await tool.execute(...toolArgs);
                console.log(`--- TOOL RESULT ---`);
                console.log(result);
                return `Thought: ${llmResponse.thought}\n\nI used the ${llmResponse.tool} tool and got the following result:\n${result}`;
            } else {
                const errorMsg = `Error: The LLM chose a tool that doesn't exist: ${llmResponse.tool}`;
                console.error(errorMsg);
                return errorMsg;
            }
        } else {
            return llmResponse.answer;
        }
    }

    listAvailableTools() {
        return this.toolManager.listTools();
    }
}

module.exports = Agent;
