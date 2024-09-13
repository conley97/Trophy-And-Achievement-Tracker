import React from 'react';
import '../../App.css';
import PSNTextBoxComponent from './PSNTextBoxComponent';
import SteamTextBoxComponent from './SteamTextBoxComponent';

export default function SignIn() {
  return  (<> <h1 className='signinh1'>Sign In</h1>
              <h2 className='signinh2'>Playstation ID Log in Below:</h2>
              <PSNTextBoxComponent />
              <h3 className='signinh3'>Steam ID Login Below:</h3>
              <SteamTextBoxComponent />

          </>);

}


