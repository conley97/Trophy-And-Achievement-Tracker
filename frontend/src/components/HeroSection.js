import React from 'react';
import '../App.css';
import './HeroSection.css';
import { Link } from 'react-router-dom';

function HeroSection() {
  return (
    <div className='hero-container'>
      <h1>Trophy and Achievement Tracker</h1>
      <p className='hero-containerp1'>
        The place where you can get all your trophies! <br /> <br />
      </p>
      <div className='hero-buttons'>
        <Link to='/login'>
          <button className='btn btn--outline'>Sign In Now</button>
        </Link>
        <Link to='/register'>
          <button className='btn btn--primary'>Register</button>
        </Link>
      </div>
    </div>
  );
}

export default HeroSection;
