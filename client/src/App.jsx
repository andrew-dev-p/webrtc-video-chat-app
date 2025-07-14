import './App.css'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import JoinRoomPage from './pages/JoinRoomPage/JoinRoomPage.jsx'
import RoomPage from './pages/RoomPage/RoomPage.jsx'
import IntroductionPage from './pages/IntroductionPage/IntroductionPage.jsx'

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/join-room">
          <JoinRoomPage />
        </Route>
        <Route path="/room">
          <RoomPage />
        </Route>
        <Route path="/">
          <IntroductionPage />
        </Route>
      </Switch>
    </Router>    
  )
}

export default App
