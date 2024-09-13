import React from 'react';
import Navbar from './components/Navbar';
import './App.css';
import Home from './components/pages/Home';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Playstation from './components/pages/Playstation';
import Steam from './components/pages/Steam';
import SignIn from './components/pages/SignIn';
import Howitworks from './components/pages/HowitWorks';
import Authors from './components/pages/Authors';
import Code from './components/pages/Code';
import Images from './components/pages/Images';
import PSNTextBoxComponent from './components/pages/PSNTextBoxComponent';
import SteamTextBoxComponent from './components/pages/SteamTextBoxComponent';
import PlaystationLogIn from './components/pages/PlaystationLogIn';
import SteamLogIn from './components/pages/SteamLogIn';
import PSNGameDetails from './components/pages/PSNGameDetails';
import SteamGameDetails from './components/pages/SteamGameDetails';
import { AuthProvider } from './context/AuthContext';
import PsnGame from './components/pages/PsnGame';
import SteamGame from './components/pages/SteamGame';
import Login from './components/pages/Login';
import Register from './components/pages/Register';
import User from './components/pages/User';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Switch>
          <Route path='/' exact component={Home} />
          <Route path='/playstation' component={Playstation} />
          <Route path='/steam' component={Steam} />
          <Route path='/signin' component={SignIn} />
          <Route path='/howitworks' component={Howitworks} />
          <Route path='/authors' component={Authors} />
          <Route path='/code' component={Code} />
          <Route path='/images' component={Images} />
          <Route path='/PSNTextBoxComponent' component={PSNTextBoxComponent} />
          <Route path='/SteamTextBoxComponent' component={SteamTextBoxComponent} />
          <Route exact path="/" component={Home} />
          <Route path='/playstationlogin' component={PlaystationLogIn} />
          <Route path='/steamlogin' component={SteamLogIn} />
          <Route path='/game/:id' component={PSNGameDetails} />
          <Route path='/login' component={Login} />
          <Route path='/register' component={Register} />
          <Route path='/user' component={User}/>
          <Route path="/psgame/:username/:gameName" component={PsnGame} />
          <Route path="/steamgame/:steamId/:gameName" component={SteamGame} />
        </Switch>
      </Router>
    </AuthProvider>
  );
}

export default App;
