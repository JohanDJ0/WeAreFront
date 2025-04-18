const API_URL = "https://rest-api-weare-production.up.railway.app/api";

interface Owner {
  id: number;
  name: string;
  email: string;
  phone: string;
  image: string;
}

export const fetchOwner = async (ownerId: number): Promise<Owner> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    const response = await fetch(`${API_URL}/owners/${ownerId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Error al obtener los datos del propietario');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching owner data:', error);
    throw error;
  }
};