import useFriend from "../hooks/useFriend";
import styles from '../styles/Friends.module.scss';
export default function FriendList() {
    const friendContext = useFriend();
    const friends = friendContext?.friends;
    return (
        <div className={styles.friendlist}>
            <p>Friends</p>
            {friends?.map((user) => {
                return (
                    <div key={user.id} className={styles.items}>
                        {user.username}
                        <button className={styles.remove} onClick={() => {}}>Remove friend</button>
                    </div>
                )
            })}
        </div>
    )
}