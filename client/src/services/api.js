const API_URL = '/api';

export const fetchDocument = async (documentId, token) => {
  const response = await fetch(`${API_URL}/documents/${documentId}`, {
    headers: {
      Authorization: token,
    },
  });

  if (!response.ok) {
    throw new Error('Error fetching document');
  }

  return response.json();
};

export const saveDocument = async (documentId, content, token) => {
  const response = await fetch(`${API_URL}/documents/${documentId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
    },
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    throw new Error('Error saving document');
  }

  return response.json();
};
