import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
export default function useFetchData<T>(url: string, options?: RequestInit): [T | null, boolean, Error | null] {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);
    const navigate = useNavigate();

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = import.meta.env.VITE_BACKEND_URL + url;
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log("fetching")
                const response = await fetch(url, options);
                if (!response.ok) {
                    if (response.status === 401) {
                        navigate('/login');
                    }
                    console.log(await response.json())
                    throw new Error(response.statusText);
                }
                const result = await response.json();
                setData(result);
            } catch (error) {
                if (error instanceof Error)
                setError(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [url, options, navigate]);
    return [data, loading, error];
}