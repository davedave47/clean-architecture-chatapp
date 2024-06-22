import { useEffect, useState, useRef } from 'react';
export function useDebounce<T>(initialValue: T | undefined = undefined, fn: ()=>void, delay: number): [T | undefined, React.Dispatch<React.SetStateAction<T | undefined>>] {
    const [value, setValue] = useState(initialValue);
    const firstRender = useRef(true);

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }
        const timeout = setTimeout(fn, delay);
        return () => clearTimeout(timeout);
    }, [value,delay]);

    return [value, setValue];
}