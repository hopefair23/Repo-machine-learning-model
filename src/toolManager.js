const fs = require('fs');
const path = require('path');

class ToolManager {
    constructor() {
        this.tools = new Map();
    }

    loadToolsFrom(directory) {
        const toolsDir = path.resolve(__dirname, directory);
        try {
            const toolFiles = fs.readdirSync(toolsDir).filter(file => file.endsWith('.js'));

            for (const file of toolFiles) {
                const toolPath = path.join(toolsDir, file);
                const ToolClass = require(toolPath);
                // To make loading more robust and compatible with mocks,
                // we instantiate the class and check the instance.
                try {
                    const toolInstance = new ToolClass();
                    if (toolInstance && typeof toolInstance.execute === 'function' && toolInstance.name) {
                        this.tools.set(toolInstance.name, toolInstance);
                    }
                } catch (e) {
                    // Ignore files that don't export a valid class constructor.
                }
            }
        } catch (error) {
            console.error(`Error loading tools from ${directory}:`, error);
        }
    }

    getTool(name) {
        return this.tools.get(name);
    }

    listTools() {
        return Array.from(this.tools.values()).map(tool => ({
            name: tool.name,
            description: tool.description,
        }));
    }
}

module.exports = ToolManager;
