import { useEffect, useState } from 'react';
export default function useFetchData<T>(url: string, options?: RequestInit): [T | null, boolean, Error | null] {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log("fetching")
                const response = await fetch(url, options);
                if (!response.ok) {
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
    }, [url, options]);
    return [data, loading, error];
}