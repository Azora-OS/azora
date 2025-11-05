// This file contains utility functions for API interactions in the Azora OS frontend. 

export const API_BASE_URL = 'https://api.azora-os.com';

export const fetchData = async (endpoint, options = {}) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`);
    }

    return response.json();
};

export const postData = async (endpoint, data) => {
    return fetchData(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
    });
};

export const putData = async (endpoint, data) => {
    return fetchData(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
};

export const deleteData = async (endpoint) => {
    return fetchData(endpoint, {
        method: 'DELETE',
    });
};

