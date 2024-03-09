let isAutomationPaused = false; // This flag controls the automation
let originalMessageText = ''; // Stores the original message text for automation


function findAllVisibleElements() {
    // Step 1: Reset previously set data-group-id attributes to ensure a clean state
    document.querySelectorAll('[data-group-id]').forEach(element => {
        element.removeAttribute('data-group-id');
    });

    let allElements = document.querySelectorAll('body *');
    let visibleElementsInfo = [];
    let groups = new Map();
    let uniqueGroupIdCounter = 0; // For generating unique group IDs

    allElements.forEach(element => {
        if (element.offsetWidth > 0 && element.offsetHeight > 0) {
            let hasVisibleChild = Array.from(element.children).some(child => child.offsetWidth > 0 && child.offsetHeight > 0);

            if (!hasVisibleChild && element.innerText.trim().length > 0 || element.tagName.toLowerCase() === 'input') {
                let isClickable = ['a', 'button'].includes(element.tagName.toLowerCase()) || element.getAttribute('role') === 'button';
                let isInput = element.tagName.toLowerCase() === 'input';
                const elementType = isInput ? 'input' : isClickable ? 'clickable' : '';
                const elementText = element.innerText.trim().length > 0 ? element.innerText.trim() : element.value;
                const elementId = element.id || ''; 

                // Determine a suitable group based on the element's ancestors
                let ancestor = element;
                for (let i = 0; i < 8; i++) {
                    if (ancestor.parentElement) {
                        ancestor = ancestor.parentElement;
                    } else {
                        break;
                    }
                }

                // Use the highest-level ancestor as the group element
                let groupElement = ancestor;
                let groupId = groupElement.getAttribute('data-group-id');
                if (!groupId) {
                    // Ensure unique groupId for each grouping
                    groupId = `group-${uniqueGroupIdCounter++}`;
                    groupElement.setAttribute('data-group-id', groupId);
                    if (!groups.has(groupId)) {
                        groups.set(groupId, []);
                    }
                }
                groups.get(groupId).push({ element: elementText, id: elementId, type: element.tagName.toLowerCase() });
            }
        }
    });

    // Convert groups to an array without group IDs for JSON serialization
    let groupedElements = [];
    groups.forEach((elements) => {
        groupedElements.push({ elements }); // Omitting groupId in the output
    });

    return groupedElements;
}



// Chatbot code modifications
async function sendChatMessage(messageText, elementsResultString) {
    // Trigger allElementsButton functionality before sending the chat message
    // const elementsResult = findAllVisibleElements(); // Get all visible elements
    // const elementsResultString = JSON.stringify(elementsResult); // Convert elements result to string for appending
    const instruction = `You are a UI navigator. Given a {task} and the current {webpage_elements}, your job is to provide the one element that needs to be interacted with. Analyze the task and webpage elements carefully. If the interaction involves an input field, specify the text to be entered; otherwise, leave the ‘input_text’ field empty. 
Respond in the following JSON format:
\`\`\`{{"the_element_interaction": [
    {{"element_of_this_step": "element_name", "id": "element_id", "type": "element_type", "correct_webpage": "yes_or_no", "input_text": "text_if_needed", "reason": "explanation_of_choice"}}
]}}\`\`\`
Ensure the response is valid JSON in the action_input. You must respond in such a format for all our conversation and my next input will only be {webpage_elements}.`;
    const combinedMessage = instruction + "task: " + messageText + "webpage_elements:" + elementsResultString; // Append elements result to user's input

    // const combinedMessage = messageText;
    const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({ text: combinedMessage }),
    });
    const jsonResponse = await response.json();

    // New code: Save the AI response to local storage
    const chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];
    chatHistory.push({ text: jsonResponse.output, sender: 'ai' }); // Assume jsonResponse.output contains the AI response text
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));

    return jsonResponse;
}


async function automateProcess() {
    if (isAutomationPaused) return; // Exit if automation is paused

    // Perform the actions as outlined, starting with finding all visible elements and sending the chat message
    const elementsResult = findAllVisibleElements();
    const elementsResultString = JSON.stringify(elementsResult);
    const response = await sendChatMessage(originalMessageText, elementsResultString);
    const action_element = JSON.parse(response.output);

    // Process the response to determine the next action
    await processChatbotResponse(action_element);

    // Display AI's response in the chatbox
    const aiMessage = document.createElement('div');
    aiMessage.style.textAlign = 'left';
    aiMessage.innerHTML = `<div style="display: inline-block; background-color: #f1f1f1; color: #333; padding: 5px 10px; border-radius: 4px; margin-top: 5px;">${response.output}</div>`; // Assuming response.output contains the AI response text
    document.getElementById('chatbox-messages').appendChild(aiMessage);
    document.getElementById('chatbox-messages').scrollTop = document.getElementById('chatbox-messages').scrollHeight;

    // Check if there's an element to interact with and perform the interaction
    const elementToInteract = action_element.the_element_interaction[0].element_of_this_step;
    if (elementToInteract) {
        findAllElementsWithText(elementToInteract);
    }

    // Display the reason for the chatbot's decision (if needed, it seems you're already doing something similar)
    // You can adjust or remove this part depending on how you want to handle the display of AI reasoning

    // Clear the input box after processing
    document.getElementById('chatbox-input').value = '';

    // Continue the process after a short delay to allow for UI updates and response handling
    setTimeout(() => {
        if (!isAutomationPaused) automateProcess();
    }, 5000); // Adjust the delay as needed
}


function highlightElement(uniqueId, inputText) {
    const element = document.querySelector(`[data-highlight-id='${uniqueId}']`);
    if (element) {
        // can use id to find and click on elements instead of text matching

      // Check if the element is an input and part of a form
      if (element.tagName.toLowerCase() === 'input') {
        element.value = inputText; // Set the input text
  
        // Find the parent form of the input element, if any
        let parentForm = element.closest('form');
        if (parentForm) {
          // Submit the form programmatically
          parentForm.submit();
        } else {
          // Simulate the Enter key press for inputs not within a form
          const event = new KeyboardEvent('keypress', {
            key: 'Enter',
            code: 'Enter',
            which: 13,
            keyCode: 13,
            bubbles: true,
            cancelable: true
          });
          element.dispatchEvent(event);
        }
      }
    }
  }
  

  function findAllElementsWithText(textToFind) {
    let xpath = `//*[text()='${textToFind}']`;
    let matchingElements = [];
    let results = document.evaluate(xpath, document, null, XPathResult.ANY_TYPE, null);
    let currentElement = results.iterateNext();
    
    while (currentElement) {
      // Store the outerHTML of each matching element
      matchingElements.push(currentElement.outerHTML);
      
      // Highlight the element by adding a red border
      currentElement.style.border = '2px solid red';
      currentElement.style.boxSizing = 'border-box'; // Ensure border is within element's dimensions
  
      // Trigger a click event on the element
      currentElement.click();
  
      currentElement = results.iterateNext();
    }
    
    if (matchingElements.length > 0) {
      return matchingElements;
    } else {
      return ['Element not found'];
    }
  }


let uniqueIdCounter = 0;
async function processChatbotResponse(response) {
    const theElementInteraction = response.the_element_interaction[0];

    let elementToInteract;
    if (theElementInteraction.id) {
        elementToInteract = document.getElementById(theElementInteraction.id);
    } else {
        elementToInteract = Array.from(document.querySelectorAll(theElementInteraction.type))
            .find(el => el.textContent.includes(theElementInteraction.element_of_this_step));
    }

    if (elementToInteract) {
        const uniqueId = `chatbot-interaction-${uniqueIdCounter++}`;
        elementToInteract.setAttribute('data-highlight-id', uniqueId);

        if (theElementInteraction.type === 'input' && theElementInteraction.input_text) {
            // Call highlightElement with the uniqueId and the input text
            highlightElement(uniqueId, theElementInteraction.input_text);
        } else {
            // Just highlight the element
            elementToInteract.style.border = '2px solid red';
        }
    }
}




function createChatBox() {
    if (document.getElementById('chatbox-container')) return;

    const chatboxContainer = document.createElement('div');
    chatboxContainer.id = 'chatbox-container';
    chatboxContainer.style = 'position: fixed; bottom: 20px; right: 20px; width: 300px; height: 450px; background-color: #f1f1f1; box-shadow: 0 4px 8px rgba(0,0,0,0.1); border-radius: 8px; display: flex; flex-direction: column; z-index: 99999;';

    const chatboxHeader = document.createElement('div');
    chatboxHeader.style = 'padding: 10px; background-color: #007bff; color: #ffffff; text-align: center; border-top-left-radius: 8px; border-top-right-radius: 8px;';
    chatboxHeader.innerHTML = 'AI Action Monitor';
    chatboxContainer.appendChild(chatboxHeader);

    const chatboxMessages = document.createElement('div');
    chatboxMessages.id = 'chatbox-messages';
    chatboxMessages.style = 'flex-grow: 1; overflow-y: auto; padding: 10px;';
    chatboxContainer.appendChild(chatboxMessages);

    const chatboxInputContainer = document.createElement('div');
    chatboxInputContainer.style = 'padding: 10px;';
    const chatboxInput = document.createElement('input');
    chatboxInput.id = 'chatbox-input';
    chatboxInput.type = 'text';
    chatboxInput.style = 'width: 97%; padding: 10px; border-radius: 4px; border: 1px solid #ccc;';
    chatboxInputContainer.appendChild(chatboxInput);
    chatboxContainer.appendChild(chatboxInputContainer);

    // Load and display chat history
    const chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];
    chatHistory.forEach(msg => {
        const messageDiv = document.createElement('div');
        messageDiv.style.textAlign = msg.sender === 'user' ? 'right' : 'left';
        messageDiv.innerHTML = `<div style="display: inline-block; background-color: ${msg.sender === 'user' ? '#007bff' : '#f1f1f1'}; color: ${msg.sender === 'user' ? '#ffffff' : '#333'}; padding: 5px 10px; border-radius: 4px; margin-top: 5px;">${msg.text}</div>`;
        chatboxMessages.appendChild(messageDiv);
    });


    chatboxInput.addEventListener('keypress', async function(e) {
        if (e.key === 'Enter' && chatboxInput.value.trim() !== '') {
            // Display the user's message in the chatbox
            const userMessage = document.createElement('div');
            userMessage.style.textAlign = 'right';
            userMessage.innerHTML = `<div style="display: inline-block; background-color: #007bff; color: #ffffff; padding: 5px 10px; border-radius: 4px; margin-top: 5px;">${chatboxInput.value}</div>`;
            chatboxMessages.appendChild(userMessage);
            chatboxMessages.scrollTop = chatboxMessages.scrollHeight;

            // Save the user's message to localStorage
            const newChatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];
            newChatHistory.push({ text: chatboxInput.value, sender: 'user' });
            localStorage.setItem('chatHistory', JSON.stringify(newChatHistory));

            // Set the original message text for the automation process
            originalMessageText = chatboxInput.value;
            chatboxInput.value = ''; // Clear the input box after processing

            // Start or continue the automation process with the new user input
            await automateProcess();
        }
    });

    // Bottom Button Container
    const buttonContainer = document.createElement('div');
    buttonContainer.style = 'display: flex;';

    // Restart Button
    const restartBtn = document.createElement('button');
    restartBtn.innerText = 'Restart';
    restartBtn.style = 'flex: 1; padding: 10px; border: none; background-color: #0056b3; color: white; border-bottom-left-radius: 8px; cursor: pointer;';
    restartBtn.addEventListener('click', function() {
        localStorage.removeItem('chatHistory');
        while (chatboxMessages.firstChild) {
            chatboxMessages.removeChild(chatboxMessages.firstChild);
        }
    });

    // Pause/Continue Button
    const pauseContinueBtn = document.createElement('button');
    pauseContinueBtn.innerText = 'Pause';
    pauseContinueBtn.style = 'flex: 1; padding: 10px; border: none; background-color: #FF0044; color: white; border-bottom-right-radius: 8px; cursor: pointer;';
    pauseContinueBtn.addEventListener('click', function() {
        if (pauseContinueBtn.innerText === 'Pause') {
            isAutomationPaused = true;
            pauseContinueBtn.innerText = 'Continue';
        } else {
            isAutomationPaused = false;
            pauseContinueBtn.innerText = 'Pause';
        }
    });
    

    // Add buttons to the button container
    buttonContainer.appendChild(restartBtn);
    buttonContainer.appendChild(pauseContinueBtn);

    // Append the button container to the chatboxContainer
    chatboxContainer.appendChild(buttonContainer);

    document.body.appendChild(chatboxContainer);
}

// Call createChatBox to display the chatbox when the extension is loaded
createChatBox();
