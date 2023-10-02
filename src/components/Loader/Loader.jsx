import React from 'react';
import styles from './Loader.module.scss'; // Importez le fichier CSS Loader.css

const Loader = () => {
  return (
    <div className={styles.loader}>
      <div className={styles.loaderspinner}></div>
    </div>
  );
};

export default Loader;
