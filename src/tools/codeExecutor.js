const vm = require('vm');

class CodeExecutionTool {
    constructor() {
        this.name = "code_executor";
        this.description = "Executes a given string of JavaScript code in a sandboxed environment. The code should be self-contained and return a value. For example: `return 1 + 1;`";
    }

    async execute(code) {
        console.log(`Executing code: "${code}"`);
        try {
            // Create a sandboxed context.
            // We can inject some safe globals if needed, but for now, let's keep it minimal.
            const sandbox = {};
            const context = vm.createContext(sandbox);

            // We should wrap the user's code in a function to ensure it can use `return`.
            // And to prevent it from polluting the global scope of the sandbox.
            const script = new vm.Script(`(function() { ${code} })()`);

            // Execute the script in the context.
            // We should add a timeout to prevent long-running code.
            const result = script.runInContext(context, { timeout: 5000 }); // 5-second timeout

            return JSON.stringify(result);
        } catch (error) {
            console.error("Code execution error:", error.message);
            // Return the error message to the agent so it knows its code failed.
            return `Error: ${error.message}`;
        }
    }
}

module.exports = CodeExecutionTool;
