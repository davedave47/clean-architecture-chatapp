import { useState, FormEvent } from "react";
import {Link, useNavigate} from 'react-router-dom';
export default function LoginPage(){
    const nagivate = useNavigate();
    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({email, password}),
            credentials: 'include'
        });
        if (response.ok) 
            nagivate('/chat');
    }
    return (
        <div>
            <form onSubmit={handleSubmit}> 
                <label>Email</label>
                <input type="text" onChange={(e) => setEmail(e.target.value)} value={email} placeholder="Email"/>
                <label>Password</label>
                <input type="password" onChange={(e) => setPassword(e.target.value)} value={password} placeholder="Password"/>
                <button>Submit</button>
            </form>
            <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
        </div>
    )   
}