# Friction Log

**Task 1: Integrating Google Gemini API for email parsing.**
*   **Expected:** A simple API key generation and straightforward JSON output.
*   **Actual:** Google had deprecated older models (like gemini-1.5 and 2.5) for new accounts, resulting in 404 errors. Also, the AI sometimes wrapped the JSON in markdown blocks, which crashed the backend.
*   **Workaround:** Updated the code to the latest model (`gemini-3.5-flash-lite`). Added a `.replace(/```json|```/g, '')` regex function in the backend to strip out markdown before parsing the JSON.
*   **Severity:** High (Blocked initial development).
*   **Suggestion:** The Google AI Studio should clearly warn users about which models are deprecated for new accounts. 

**Task 2: Testing the MCP server for the Alexa+ Track.**
*   **Expected:** I assumed there would be a web-based simulator or GUI to test the MCP server tools.
*   **Actual:** The `@modelcontextprotocol/sdk` uses standard I/O (stdio), meaning it only runs in the terminal. It was difficult to test how it would work with a frontend UI.
*   **Workaround:** I built a custom HTTP wrapper (`/api/mcp/parse-email`) inside my Express backend to make the MCP tool accessible via the browser. I also built a simulated Alexa+ voice UI in React so judges can see it working visually.
*   **Severity:** Medium (Required extra coding time).
*   **Suggestion:** Provide an official web-based MCP testing GUI for developers so they don't have to rely on terminal commands or build custom HTTP wrappers.