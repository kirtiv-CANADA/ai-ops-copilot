# Friction Log

**Task 1: Integrating Google Gemini API for email parsing.**
*   **Expected:** A simple API key generation and straightforward JSON output.
*   **Actual:** Google had deprecated older models (like gemini-1.5 and 2.5) for new accounts, resulting in 404 errors. Also, the AI sometimes wrapped the JSON in markdown blocks, which crashed the backend.
*   **Workaround:** Updated the code to the latest model (`gemini-3.5-flash-lite`). Added a `.replace(/```json|```/g, '')` regex function in the backend to strip out markdown before parsing the JSON.
*   **Severity:** High (Blocked initial development).
*   **Suggestion:** The Google AI Studio should clearly warn users about which models are deprecated for new accounts. 

**Task 2: Testing the MCP server for the Alexa+ Track.**
*   **Expected:** To test the MCP tools visually and see how they integrate with a frontend UI, I expected an easy web-based simulator in the Alexa+ track resources.
*   **Actual:** The `@modelcontextprotocol/sdk` uses standard I/O (stdio). I later discovered the official "MCP Inspector" (via npx), which is excellent for testing the backend tool via CLI. However, the Alexa+ resources lacked examples of how a web app could simulate a voice UI calling these tools. 
*   **Workaround:** I used the MCP Inspector to test my `parse_email` tool. For the frontend, I built a custom HTTP wrapper (`/api/mcp/parse-email`) in my Express backend and created a simulated Alexa voice UI in React.
*   **Severity:** Medium.
*   **Suggestion:** The Alexa+ track resources should link to the MCP Inspector for backend testing, and also provide a basic example of how to build a simulated Alexa voice web UI to test the frontend flow.

**Task 3: Creating an AWS account to use Amazon Bedrock as the AI engine.**
*   **Expected:** Quick sign up using email, phone, and a credit card for verification.
*   **Actual:** Blocked at the DigiLocker verification step. The OTP was being sent to a data-only eSIM which could not receive SMS, making it impossible to verify my identity. 
*   **Workaround:** I pivoted to the Google Gemini API (`gemini-3.5-flash-lite`) for my AI engine. Because of this, I could not participate in the AWS Builder Mini Challenge.
*   **Severity:** High (It blocked me from using AWS services).
*   **Suggestion:** AWS should provide an alternative verification method (like a manual document upload) for developers in India who face eSIM/OTP issues, so they are not locked out of the free tier.
