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
    }
    return true; // Return true to indicate an asynchronous response
});
