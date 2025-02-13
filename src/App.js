import { BrowserRouter } from 'react-router-dom';
import './App.css';
import { NavRouters } from './Components/NavRouters';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <NavRouters />
      </BrowserRouter>
    </div>
  );
}

export default App;
