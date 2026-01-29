import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const location = useLocation();

  const navItems = [
    { label: "Home", path: "/" },
    {
      label: "The Hall",
      path: "/hall",
      children: [
        { label: "Overview", path: "/hall" },
        { label: "Events Schedule", path: "/hall/events" }
      ]
    },
    { label: "Churches", path: "/churches" },
    { label: "Committee", path: "/committee" },
    { label: "Businesses", path: "/businesses" },
    { label: "Contact", path: "/contact" },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Announcement Banner */}
      <div className="bg-primary-600 text-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <span>
              Celebrating 100 Years of the community hall • 1926
              - 2026
            </span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link to="/" className="flex flex-col">
              <h1 className="text-2xl text-gray-800">
                Penmaen and Nicholaston
              </h1>
              <p className="text-sm text-gray-600">
                Village Hall
              </p>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-2">
              {navItems.map((item) => (
                <div key={item.path} className="relative group">
                  {item.children ? (
                    <div
                      className="relative"
                      onMouseEnter={() => setActiveDropdown(item.label)}
                      onMouseLeave={() => setActiveDropdown(null)}
                    >
                      <button
                        className={`px-5 py-2 rounded-lg transition-colors flex items-center gap-1 ${isActive(item.path)
                          ? "bg-primary-600 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                          }`}
                      >
                        {item.label}
                        <ChevronDown className="w-4 h-4" />
                      </button>

                      {activeDropdown === item.label && (
                        <div className="absolute top-full left-0 w-48 pt-2">
                          <div className="bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden py-2">
                            {item.children.map((child) => (
                              <Link
                                key={child.path}
                                to={child.path}
                                className={`block px-4 py-2 text-sm hover:bg-primary-50 hover:text-primary-600 ${location.pathname === child.path ? 'text-primary-600 font-medium' : 'text-gray-700'
                                  }`}
                              >
                                {child.label}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      to={item.path}
                      className={`px-5 py-2 rounded-lg transition-colors inline-block ${isActive(item.path)
                        ? "bg-primary-600 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                        }`}
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-gray-700" />
              ) : (
                <Menu className="h-6 w-6 text-gray-700" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <nav className="md:hidden pb-4 space-y-2">
              {navItems.map((item) => (
                <div key={item.path}>
                  {item.children ? (
                    <div className="space-y-1">
                      <div className="px-4 py-2 font-medium text-gray-900 border-b border-gray-100 mb-2">
                        {item.label}
                      </div>
                      {item.children.map((child) => (
                        <Link
                          key={child.path}
                          to={child.path}
                          onClick={() => setIsMenuOpen(false)}
                          className={`block px-4 py-2 pl-8 rounded-md transition-colors ${location.pathname === child.path
                            ? "bg-primary-50 text-primary-700"
                            : "text-gray-600 hover:bg-gray-50"
                            }`}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <Link
                      to={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`block px-4 py-2 rounded-md transition-colors ${isActive(item.path)
                        ? "bg-primary-600 text-white"
                        : "text-gray-700 hover:bg-primary-100"
                        }`}
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          )}
        </div>
      </header>
    </>
  );
}