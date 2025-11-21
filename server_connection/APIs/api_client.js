export const API_URL = 'http://localhost:3001';

export async function get_client({phone_number}) {
    console.log(`Fetching client with phone number: ${phone_number}`);
    const response = await fetch(`${API_URL}/client/${phone_number}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (response.status === 200) {
        const data = await response.json();
        return data;
    }else {
        throw new Error(`Error fetching client: ${response.statusText}`);
    }
};