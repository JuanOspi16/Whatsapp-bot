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

export async function get_state({user_phone}) {
    const response = await fetch(`${API_URL}/state/${user_phone}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    if (response.status === 200) {
        const data = await response.json();
        return data;
    } else {
        throw new Error(`Error fetching state: ${response.statusText}`);
    }
};

export async function create_state({user_phone, step, client_id}) {
    const response = await fetch(`${API_URL}/state`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_phone, step, client_id }),
    });
    if (response.status === 200) {
        const data = await response.json();
        return data;
    }
    else {
        throw new Error(`Error creating state: ${response.statusText}`);
    }
};

export async function update_state({id, step, employee_selected, selected_date, selected_time}) {
    const response = await fetch(`${API_URL}/state/${id}`, {
        method: 'PUT',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step, employee_selected, selected_date, selected_time }),
    });
    if (response.status === 200) {
        const data = await response.json();
        return data;
    }
    else {
        throw new Error(`Error updating state: ${response.statusText}`);
    }
};
