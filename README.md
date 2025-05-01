# Context-Aware UI Navigator

A sophisticated Chrome extension that uses AI to understand and automate UI navigation tasks by maintaining context awareness of the current webpage state and user intentions.

## Features

- **Contextual Understanding**: Analyzes webpage elements in real-time to understand the current UI state
- **Intelligent Element Detection**: Groups and categorizes UI elements based on their visual and functional relationships
- **Automated Navigation**: Executes multi-step workflows automatically while maintaining context
- **Conversational Interface**: Provides a chat interface for natural language interaction
- **State Persistence**: Maintains chat history and navigation context across page reloads
- **Smart Element Grouping**: Groups related UI elements for better context understanding
- **Visual Feedback**: Highlights target elements during navigation

## Architecture

### Backend (`/app`)

- **main.py**: FastAPI server implementation with chat endpoint
- **agents.py**: LangChain-based conversational agent configuration
- **models.py**: Pydantic models for request/response handling

### Extension (`/extension`)

- **background.js**: Manages extension state and cross-script communication
- **content/content.js**: Core UI analysis and automation logic
- **manifest.json**: Extension configuration and permissions

## Technical Implementation

### Backend Components

1. **FastAPI Server**
   - Implements async chat endpoint for processing user queries
   - CORS configuration for extension communication
   - Utilizes Pydantic for request validation

2. **LangChain Agent**
   - Uses GPT-4 for natural language understanding
   - Implements conversation memory for context retention
   - Configurable agent parameters for optimal response generation

### Extension Components

1. **Element Analysis Engine**
   - Implements sophisticated element detection algorithm
   - Groups elements based on visual hierarchy
   - Maintains element relationships for context
   - Handles dynamic webpage content

2. **Automation System**
   - Executes navigation actions based on AI responses
   - Implements pause/resume functionality
   - Handles page navigation events
   - Provides visual feedback for actions

3. **State Management**
   - Maintains chat history across sessions
   - Handles page reload scenarios
   - Manages automation state
   - Implements cross-script communication

4. **UI Components**
   - Chat interface for user interaction
   - Visual highlighting of target elements
   - Progress indicators for automation
   - Error handling and user feedback

## Prerequisites

- Python 3.7+
- Chrome browser
- OpenAI API key

## Environment Setup

1. Create a `.env` file in the `/app` directory:
```
OPENAI_API_KEY="your-api-key-here"
```

## Installation

### Backend Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Start the FastAPI server:
```bash
uvicorn app.main:app --reload --port 8000
```

### Extension Setup

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the `extension` directory
4. The Context-Aware UI Navigator icon should appear in your toolbar

## Usage

1. Click the extension icon to activate
2. Enter your navigation task in natural language
3. The extension will:
   - Analyze the current webpage
   - Identify relevant UI elements
   - Execute navigation steps automatically
   - Provide visual feedback for each action
   - Maintain context across page changes

## Technical Details

### Element Detection Algorithm

The extension implements a sophisticated element detection system that:
- Identifies visible elements on the page
- Groups related elements based on DOM hierarchy
- Maintains element relationships for context
- Handles dynamic content updates

### AI Integration

- Uses GPT-4 for natural language understanding
- Implements conversation memory for context retention
- Provides structured JSON responses for automation
- Maintains conversation history across sessions

### Automation Engine

- Executes navigation actions based on AI responses
- Implements smart retry logic for failed actions
- Handles page navigation events
- Provides visual feedback for actions

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[Add your chosen license here]
