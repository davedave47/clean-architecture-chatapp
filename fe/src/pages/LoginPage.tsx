import { useState, FormEvent, useEffect } from "react";
import {Link, useNavigate} from 'react-router-dom';
import styles from '../styles/LoginPage.module.scss';
import { useAuth } from "../hooks/useAuth";
export default function LoginPage(){
    const {result, loading} = useAuth();
    const nagivate = useNavigate();
    useEffect(() => {
        if (result) {
            nagivate('/chat');
        }
        if (!loading) {
            return
        }
    },[result, nagivate, loading])
    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [error, setError] = useState<string>('')
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!email || !password) {
            setError("Please fill out all fields")
            return;
        }
        const response = await fetch(import.meta.env.VITE_BACKEND_URL+'api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({email, password}),
            credentials: 'include'
        });
        if (response.ok) 
            nagivate('/chat');
        else if (response.status === 401)
            setError("Invalid email or password")
        else
            setError("Error logging in")
    }
    return (
        <div className={styles.loginContainer}>
            <form onSubmit={handleSubmit} className={styles.loginForm}> 
                <label>Email</label>
                <input type="text" onChange={(e) => setEmail(e.target.value)} value={email} placeholder="Email"/>
                <label>Password</label>
                <input type="password" onChange={(e) => setPassword(e.target.value)} value={password} placeholder="Password"/>
                <button>Submit</button>
                {!error || <p className={styles.error}>{error}</p>}
                <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
            </form>
        </div>
    )   
}