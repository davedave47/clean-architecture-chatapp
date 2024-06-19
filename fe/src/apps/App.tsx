import '../styles/App.module.scss'
import { Navigate } from 'react-router-dom'
import {useSelector} from 'react-redux'
import { RootState } from '../redux'
function App() {
  const user = useSelector((state: RootState) => state.user);
  return (
    <div>
      {user.id ? <Navigate to="/chat" /> : <Navigate to="/login" />}
    </div>  
    )
}

export default App
