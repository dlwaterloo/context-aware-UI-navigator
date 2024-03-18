let chatHistory = [];

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "saveChatHistory") {
        // Save the entire chat history received from the content script
        chatHistory = request.chatHistory;
        sendResponse({status: "success"});
    } else if (request.action === "getChatHistory") {
        // Send the current chat history to the content script
        sendResponse(chatHistory);
    } else if (request.action === "updateChatHistory") {
        // Update the chat history with a new message from the user or AI
        chatHistory.push({text: request.text, sender: request.sender});
        sendResponse({status: "success"});
    } else if (request.action === "clearChatHistory") {
        // Clear the chat history
        chatHistory = [];
        sendResponse({status: "success"});
    } else if (request.action === "injectScript") {
        injectContentScript();
        sendResponse({status: "script injected"});
    }
    return true; // Return true to indicate an asynchronous response
});

// Function to inject content script into the current active tab
function injectContentScript() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.scripting.executeScript({
            target: {tabId: tabs[0].id},
            files: ['content/content.js'],
        });
    });
}

// Optionally, automatically inject content script when a tab is updated to a new URL
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete' && tab.active) {
        // Clear chat history for the tab
        chrome.runtime.sendMessage({action: "clearChatHistory"}, function(response) {
            console.log("Chat history cleared for tab:", tabId, response.status);
        });
        injectContentScript();
    }
});


