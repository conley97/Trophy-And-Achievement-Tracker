import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import AuthContext from '../context/AuthContext'; // Import AuthContext

function Navbar() {
  const [click, setClick] = useState(false);
  const { user } = useContext(AuthContext); // Destructure user from AuthContext

  const handleClick = () => setClick(!click);
  const closeMobileMenu = () => setClick(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 960) {
        setClick(false); // Ensure menu is closed when resizing to a larger screen
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <>
      <nav className='navbar'>
        <div className='navbar-container'>
          <Link to='/' className='navbar-logo' onClick={closeMobileMenu}>
            T.A.T
            <i className='fab fa-typo3' />
          </Link>
          <div className='menu-icon' onClick={handleClick}>
            <i className={click ? 'fas fa-times' : 'fas fa-bars'} />
          </div>
          <ul className={click ? 'nav-menu active' : 'nav-menu'}>
            <li className='nav-item'>
              <Link to='/' className='nav-links' onClick={closeMobileMenu}>
                Home
              </Link>
            </li>
            <li className='nav-item'>
              <Link
                to='/playstation'
                className='nav-links'
                onClick={closeMobileMenu}
              >
                Playstation
              </Link>
            </li>
            <li className='nav-item'>
              <Link
                to='/steam'
                className='nav-links'
                onClick={closeMobileMenu}
              >
                Steam
              </Link>
            </li>
            {/* Conditional rendering based on user login status */}
            {!user ? (
              <>
                <li className='nav-item'>
                  <Link
                    to='/register'
                    className='nav-links'
                    onClick={closeMobileMenu}
                  >
                    Register
                  </Link>
                </li>
                <li className='nav-item'>
                  <Link
                    to='/login'
                    className='nav-links'
                    onClick={closeMobileMenu}
                  >
                    Login
                  </Link>
                </li>
              </>
            ) : (
              <li className='nav-item'>
                <Link
                  to='/user'
                  className='nav-links'
                  onClick={closeMobileMenu}
                >
                  User
                </Link>
              </li>
            )}
          </ul>
        </div>
      </nav>
    </>
  );
}

export default Navbar;
