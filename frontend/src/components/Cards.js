import React from 'react';
import './Cards.css';
import CardItem from './CardItem';

function Cards() {
  return (
    <div className='cards'>
      <h1>Check out these gaming platforms!</h1>
      <div className='cards__container'>
        <div className='cards__wrapper'>
          <ul className='cards__items'>
            <CardItem
              src='https://download.logo.wine/logo/PlayStation/PlayStation-Logo.wine.png'
              text='Try out Playstation'
              label='Playstation'
              path='/playstation'
            />
            <CardItem
              src='https://download.logo.wine/logo/Steam_(service)/Steam_(service)-Logo.wine.png'
              text='Try out Steam'
              label='Steam'
              path='/steam'
            />
   
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Cards;
