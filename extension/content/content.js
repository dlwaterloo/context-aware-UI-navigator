// Webpage element scraper code
function findAllVisibleElementsAndDisplay() {
    const resultsElement = document.getElementById('results');
    resultsElement.innerHTML = ''; // Clear previous results

    const groupedElements = findAllVisibleElements();
    // Convert groupedElements to JSON and display
    const json = JSON.stringify(groupedElements, null, 2);
    const pre = document.createElement('pre');
    pre.style.overflow = 'auto';
    pre.textContent = json;
    resultsElement.appendChild(pre);
}


function findAllVisibleElements() {
    let allElements = document.querySelectorAll('body *');
    let visibleElementsInfo = [];
    let groups = new Map();

    allElements.forEach(element => {
      if (element.offsetWidth > 0 && element.offsetHeight > 0) {
        let hasVisibleChild = Array.from(element.children).some(child => child.offsetWidth > 0 && child.offsetHeight > 0);

        if (!hasVisibleChild && element.innerText.trim().length > 0 || element.tagName.toLowerCase() === 'input') {
          let isClickable = ['a', 'button'].includes(element.tagName.toLowerCase()) || element.getAttribute('role') === 'button';
          let isInput = element.tagName.toLowerCase() === 'input';
          const elementType = isInput ? 'input' : isClickable ? 'clickable' : '';
          const elementText = element.innerText.trim().length > 0 ? element.innerText.trim() : element.value;
          const elementId = element.id || ''; // Capture the element's ID attribute

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
            groupId = 'group'; // Simplify groupId since it will not be included in the output
            groupElement.setAttribute('data-group-id', groupId);
            if (!groups.has(groupId)) {
              groups.set(groupId, []);
            }
          }
          groups.get(groupId).push({ element: elementText, id: elementId, type: element.tagName.toLowerCase() }); // Include elementId in the output
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
async function sendChatMessage(messageText) {
    // Trigger allElementsButton functionality before sending the chat message
    const elementsResult = findAllVisibleElements(); // Get all visible elements
    const elementsResultString = JSON.stringify(elementsResult); // Convert elements result to string for appending
    const instruction = `You are a UI navigator. Given a {task} and the current {webpage_elements}, your job is to provide the one element that needs to be interacted with. Analyze the task and webpage elements carefully. If the interaction involves an input field, specify the text to be entered; otherwise, leave the ‘input_text’ field empty. 
Respond in the following JSON format:
\`\`\`{{"the_element_interaction": [
    {{"element_of_this_step": "element_name", "id": "element_id", "type": "element_type", "correct_webpage": "yes_or_no", "input_text": "text_if_needed", "reason": "explanation_of_choice"}}
]}}\`\`\`
Ensure the response is valid JSON in the action_input. You must respond in such a format for all our conversation and my next input will only be {webpage_elements}.`;
    const combinedMessage = instruction + "task: " + messageText + "webpage_elements:" + elementsResultString; // Append elements result to user's input

    const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({ text: combinedMessage }),
    });
    return response.json();
}


  function highlightElement(uniqueId, inputText) {
    const element = document.querySelector(`[data-highlight-id='${uniqueId}']`);
    if (element) {
      element.style.border = '2px solid green';
  
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
      } else {
        // If it's not an input, just click the element
        element.click();
      }
    }
  }
  
  
  async function processChatbotResponse(response) {
    const theElementInteraction = response.the_element_interaction[0];
    let uniqueIdCounter = 0; // You might want to manage this counter globally or in a different way

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

    chatboxInput.addEventListener('keypress', async function(e) {
        if (e.key === 'Enter' && chatboxInput.value.trim() !== '') {
            const userMessage = document.createElement('div');
            userMessage.style.textAlign = 'right';
            userMessage.innerHTML = `<div style="display: inline-block; background-color: #007bff; color: #ffffff; padding: 5px 10px; border-radius: 4px; margin-top: 5px;">${chatboxInput.value}</div>`;
            chatboxMessages.appendChild(userMessage);
            chatboxMessages.scrollTop = chatboxMessages.scrollHeight;

            const response = await sendChatMessage(chatboxInput.value);
            const output_response = response.output;

            const action_element = JSON.parse(output_response);
            processChatbotResponse(action_element)
            const elementToInteract = taskDetails.the_element_interaction[0].element_of_this_step;
            // findAllElementsWithText(elementToInteract);

            const responseMessage = document.createElement('div');
            responseMessage.style.textAlign = 'left';
            responseMessage.innerHTML = `<div style="display: inline-block; background-color: #f1f1f1; color: #333; padding: 5px 10px; border-radius: 4px; margin-top: 5px;">${elementToInteract}</div>`;

            chatboxMessages.appendChild(responseMessage);
            chatboxMessages.scrollTop = chatboxMessages.scrollHeight;

            chatboxInput.value = '';

        }
    });


    // Pause/Continue Button
    const pauseContinueBtn = document.createElement('button');
    pauseContinueBtn.innerText = 'Pause'; // Initial text
    pauseContinueBtn.style.padding = '10px';
    pauseContinueBtn.style.width = '100%';
    pauseContinueBtn.style.border = 'none';
    pauseContinueBtn.style.backgroundColor = '#007bff';
    pauseContinueBtn.style.color = 'white';
    pauseContinueBtn.style.borderBottomLeftRadius = '8px';
    pauseContinueBtn.style.borderBottomRightRadius = '8px';

    pauseContinueBtn.addEventListener('click', function() {
        const chatboxInput = document.getElementById('chatbox-input'); // Ensure this ID is set for the chatbox input element
        if (pauseContinueBtn.innerText === 'Pause') {
            chatboxInput.disabled = true; // Disable input
            pauseContinueBtn.innerText = 'Continue';
        } else {
            chatboxInput.disabled = false; // Enable input
            pauseContinueBtn.innerText = 'Pause';
        }
    });

    // Add the pause/continue button to the container
    chatboxContainer.appendChild(pauseContinueBtn);
    document.body.appendChild(chatboxContainer);
}

// Call createChatBox to display the chatbox when the extension is loaded
createChatBox();

