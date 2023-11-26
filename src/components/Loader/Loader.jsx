import React from 'react';
import { useState } from 'react';
import styles from './Loader.module.scss';

const Loader = () => {
  return (
    <>
      <div className={styles.loader}>
        <div className={styles.loaderspinner}></div>
      </div>
    </>

  );
};

export default Loader;
