import React from 'react';
import './Footer.css';
import { Button } from './Button';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <div className='footer-container'>
      <section className='footer-subscription'>
        <p className='footer-subscription-heading'>
          Join the trophy and achievement tracker people's today. 
        </p>
        <p className='footer-subscription-text'>
          So that all your trophies problems could go away.
        </p>
        <div className='input-areas'>
          <form>
            <Button buttonStyle='btn--outline'>Sign In Now</Button>
          </form>
        </div>
      </section>
      <div class='footer-links'>
        <div className='footer-link-wrapper'>
          <div class='footer-link-items'>
            <h2>About Us</h2>
            <Link to='/howitworks'>How it works</Link>
            <Link to='/authors'>Authors</Link>
          </div>
          <div class='footer-link-items'>
            <h2>Work Cited</h2>
            <Link to='/code'>Code</Link>
            <Link to='/images'>Images</Link>
          </div>
        </div>
      </div>
      <section class='social-media'>
        <div class='social-media-wrap'>
          <div class='footer-logo'>
            <Link to='/' className='social-logo'>
              T.A.T
              <i class='fab fa-typo3' />
            </Link>
          </div>
          <small class='website-rights'>T.A.T 2024</small>
        </div>
      </section>
    </div>
  );
}

export default Footer;
