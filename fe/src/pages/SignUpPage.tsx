import { useState, FormEvent, useEffect } from "react";
import {Link, useNavigate} from 'react-router-dom';
import styles from '@/styles/LoginPage.module.scss';
import { useAuth } from "@/hooks/useAuth";
export default function SignUpPage(){
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
    const [username, setUsername] = useState<string>('')
    const [confirmPassword, setConfirmPassword] = useState<string>('')
    const [error, setError] = useState<string>('')
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!email || !password || !username || !confirmPassword) {
            setError("Please fill out all fields")
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords don't match")
            return;
        }
        const response = await fetch(import.meta.env.VITE_BACKEND_URL+'/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({email, password, name:username}),
            credentials: 'include'
        });
        if (response.ok)
            nagivate('/chat');
        else {
            response.json().then((data) => {
                setError(data)
            })
        }
    }
    return (
        <div className={styles.loginContainer}>
            <form onSubmit={handleSubmit} className={styles.loginForm}> 
                <label>Username</label>
                <input type="text" onChange={(e) => setUsername(e.target.value)} value={username} placeholder="Username"/>
                <label>Email</label>
                <input type="text" onChange={(e) => setEmail(e.target.value)} value={email} placeholder="Email"/>
                <label>Password</label>
                <input type="password" onChange={(e) => setPassword(e.target.value)} value={password} placeholder="Password"/>
                <label>Confirm password</label>
                <input type="password" onChange={(e) => setConfirmPassword(e.target.value)} value={confirmPassword} placeholder="Confirm password"/>
                <button>Submit</button>
                {!error || <p className={styles.error}>{error}</p>}
                <p>Already have an account? <Link to="/login">Log in</Link></p>
            </form>
        </div>
    )   
}