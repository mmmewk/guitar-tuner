import './App.scss';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import React from 'react';
import RawSound from './Components/RawSound';
import Navbar from './Components/Navbar';
import Frequency from './Components/Frequency';
import Notes from './Components/Notes';

const App : React.FC = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path='/' />
        <Route path='/raw-sound' element={<RawSound />} />
        <Route path='/frequency' element={<Frequency />} />
        <Route path='/notes' element={<Notes />} />
      </Routes>
    </Router>
  );
}

export default App;


// function App() {




//   return (
//     <React.StrictMode>
//       <RouterProvider router={router} />
//     </React.StrictMode>
//     // <div className="App">
//     //   <div className="Header">
        
//     //   </div>
//     //   <button onClick={start}>start</button>
//     //   <button onClick={stop}>stop</button>



//     //   <LineChart width={500} height={300} data={frequencyData}>
//     //     <XAxis dataKey="frequency" tickFormatter={(value) => value.toFixed(2)} />
//     //     <YAxis domain={[0, 255]} />
//     //     <CartesianGrid stroke="#eee" strokeDasharray="5 5"/>
//     //     <Line type="monotone" dataKey="intensity" stroke="#8884d8" isAnimationActive={false} dot={false} />
//     //   </LineChart>

//     //   {/* Recharts log scale doesn't work... */}
//     //   <LineChart width={500} height={300} data={logData}>
//     //     <XAxis
//     //       dataKey="halfsteps"
//     //       scale='linear'
//     //       tickFormatter={(halfsteps) => frequencyToString(C0 * halfstepMultiplier(halfsteps))}
//     //     />
//     //     <YAxis domain={[0, 255]} />
//     //     <CartesianGrid stroke="#eee" strokeDasharray="5 5"/>
//     //     <Line type="monotone" dataKey="intensity" stroke="#8884d8" isAnimationActive={false} dot={false} />
//     //   </LineChart>
//     // </div>
//   );
// }

// export default App;
