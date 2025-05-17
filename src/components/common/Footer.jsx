
import React from 'react';

const Footer = () => {
  return (
    <footer style={styles.footer}>
      <p style={styles.text}>&copy; {new Date().getFullYear()} Scholar Management System. All rights reserved.</p>
    </footer>
  );
};

const styles = {
  footer: {
    backgroundColor: '#f8f9fa',
    padding: '10px 20px',
    marginTop: '20px',
    textAlign: 'center',
  },
  text: {
    margin: 0,
    color: '#333',
  },
};

export default Footer;