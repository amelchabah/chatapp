import { useEffect } from 'react';
import styles from './Notification.module.scss';
// import styles from '../styles/index.module.scss'

const Notification = ({ title, content, onClose }) => {
    useEffect(() => {
        setTimeout(() => {onClose();}, 5000);
    }, []);

    return (
        <div className={`${styles.notification} ${styles.message}`}>
            <span className={styles.close} onClick={onClose}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg></span>
            <strong>{title}</strong>
            <p>{content}</p>
        </div>
    );
}

export default Notification;