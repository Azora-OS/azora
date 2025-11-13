const API_URL = 'http://localhost:4010/api/family';

export async function getPersonalities() {
  try {
    const response = await fetch(API_URL);
    return await response.json();
  } catch (error) {
    console.error('Error fetching personalities:', error);
    return [];
  }
}

export async function sendMessage(personality: string, message: string) {
  try {
    const response = await fetch(`${API_URL}/${personality}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });
    const data: any = await response.json();
    return data.reply;
  } catch (error) {
    console.error('Error sending message:', error);
    return 'Error connecting to the AI family.';
  }
}
