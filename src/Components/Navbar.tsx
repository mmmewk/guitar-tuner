import React from "react";
import { Link } from "react-router-dom";
const Navbar : React.FC = () => {
  return (
    <nav className="w-full h-10 bg-gray-700">
      <ul className="w-40 h-10 p-2 flex justify-between items-center list-none">
        <Link to="/raw-sound" className='mx-2 whitespace-nowrap'>
          <li className="text-gray-50">Raw Sound</li>
        </Link>
        <Link to="/frequency" className='mx-2 whitespace-nowrap'>
          <li className="text-gray-50">Frequency</li>
        </Link>
        <Link to="/notes" className='mx-2 whitespace-nowrap'>
          <li className="text-gray-50">Notes</li>
        </Link>
      </ul>
    </nav>
  );
};
export default Navbar;
