// Import React and necessary icons
import { FaCopyright, FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

export default function Footer() {
  return (
    <div className="relative bottom-0 w-full bg-gray-900 text-gray-300">
      {/* Main footer container */}
      <div className="flex flex-col md:flex-row justify-between items-center py-6 px-8 space-y-4 md:space-y-0">
        <div></div>
        {/* Left Section */}
        <div className="flex items-center gap-2">
          <FaCopyright className="h-5 w-5 text-gray-400" />
          <span className="text-sm">
            Book My Event - Mohan. All rights reserved.
          </span>
        </div>
        
        {/* Center Section: Social Media Links */}
        <div className="flex gap-4">
          <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500">
            <FaFacebook className="h-6 w-6" />
          </a>
          <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400">
            <FaTwitter className="h-6 w-6" />
          </a>
          <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-pink-500">
            <FaInstagram className="h-6 w-6" />
          </a>
          <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
            <FaLinkedin className="h-6 w-6" />
          </a>
        </div>
        
        {/* Right Section */}
        <div>
         
        </div>
      </div>
    </div>
  );
}
