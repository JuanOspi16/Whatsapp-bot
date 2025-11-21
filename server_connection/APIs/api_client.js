export const API_URL = 'http://localhost:3001';

export async function get_client({phone_number}) {
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

export async function get_employee({id}) {
    const response = await fetch(`${API_URL}/employee/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (response.status === 200) {
        const data = await response.json();
        return data;
    } else {
        throw new Error(`Error fetching employee: ${response.statusText}`);
    }
};

export async function get_services({client_id}) {
    const response = await fetch(`${API_URL}/services/${client_id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    if (response.status === 200) {
        const data = await response.json();
        return data;
    } else {
        throw new Error(`Error fetching services: ${response.statusText}`);
    }
};