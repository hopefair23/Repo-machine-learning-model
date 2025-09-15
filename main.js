const readline = require('readline');
const Agent = require('./src/agent');

const agent = new Agent();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'You> '
});

console.log("AI Agent is ready. Type your query, or 'exit' to quit.");
rl.prompt();

rl.on('line', async (line) => {
    const query = line.trim();

    if (query.toLowerCase() === 'exit' || query.toLowerCase() === 'quit') {
        rl.close();
        return;
    }

    if (query) {
        const response = await agent.processQuery(query);
        console.log(`Agent> ${response}`);
    }

    rl.prompt();
}).on('close', () => {
    console.log('Goodbye!');
    process.exit(0);
});
