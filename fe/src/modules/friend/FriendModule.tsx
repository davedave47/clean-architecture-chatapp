import { useState } from "react";
import FriendList from "@/components/friends/FriendList";
import FriendSearch from "@/components/friends/FriendSearch";
import styles from '@/styles/Friends.module.scss';
export default function FriendModule({onCancel}: {onCancel: () => void}){
    const [isSearching, setIsSearching] = useState(false);
    return (
        <div className={styles.container}>
            <button className={styles.cancel} onClick={onCancel}>X</button>
            {
            isSearching ? 
            <div className={styles.list}>
                <FriendSearch/>
                <div className={styles.buttons}>
                    <button onClick={()=>{setIsSearching(false)}}>Cancel</button>
                </div>
            </div>:
            <div className={styles.list}>
                <FriendList/>
                <div className={styles.buttons}>
                    <button onClick={() => {setIsSearching(true)}}>Add Friend</button>
                </div>
            </div>
            }
        </div>   
    )
}