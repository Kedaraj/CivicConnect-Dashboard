import { useState } from 'react';
import { Mail, Lock, Eye, Navigation, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../../api';

interface LoginPageProps {
  onLogin: (role: string) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: ''
  });
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const roles = [
    { id: 'police', name: 'Traffic Police', icon: '🚔' },
    { id: 'ambulance', name: 'Ambulance Driver', icon: '🚑' },
    { id: 'construction', name: 'Construction Authority', icon: '🚧' },
    { id: 'admin', name: 'City Authority / Admin', icon: '🏛️' }
  ];

  // Map roles to demo credentials
  const roleEmails: Record<string, string> = {
    police: 'police@civic.com',
    ambulance: 'ambulance@civic.com',
    construction: 'construction@civic.com',
    admin: 'admin@civic.com'
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.role) { setError('Please select a role'); return; }
    setError(''); setLoading(true);
    try {
      const email = formData.email || roleEmails[formData.role] || 'admin@civic.com';
      const password = formData.password || 'password123';
      try { await api.login(email, password); } catch(_) { /* ignore auth errors for demo */ }
      onLogin(formData.role);
    } catch (e: any) {
      setError(e.message || 'Login failed');
    } finally { setLoading(false); }
  };

  const selectedRole = roles.find(r => r.id === formData.role);

  return (
    <div className="fixed inset-0 bg-white overflow-auto">
      <div className="min-h-full flex items-center justify-center p-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.6 }}
              className="flex items-center gap-3 mb-8"
            >
              <div className="w-16 h-16 bg-black rounded-3xl flex items-center justify-center">
                <Navigation className="w-8 h-8 text-white" />
              </div>
              <div>
                  <h1 className="text-2xl font-bold text-black">CivicConnect</h1>
                <p className="text-sm text-gray-400">Smart Traffic Platform</p>
              </div>
            </motion.div>

            <h2 className="text-3xl font-bold text-black mb-2">Welcome back</h2>
              <p className="text-gray-400">Sign in to your CivicConnect account</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-3 px-6 rounded-2xl font-semibold transition-all ${
                !isSignUp
                  ? 'bg-white text-black shadow-sm'
                  : 'bg-transparent text-gray-400'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-3 px-6 rounded-2xl font-semibold transition-all ${
                isSignUp
                  ? 'bg-white text-black shadow-sm'
                  : 'bg-transparent text-gray-400'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-gray-50 border-0 rounded-2xl pl-12 pr-4 py-4 text-black placeholder-gray-400 focus:outline-none focus:ring-0"
                  placeholder="Email address"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-gray-50 border-0 rounded-2xl pl-12 pr-12 py-4 text-black placeholder-gray-400 focus:outline-none focus:ring-0"
                  placeholder="Password"
                />
                <Eye className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 cursor-pointer" />
              </div>
            </div>

            {/* Role Selection */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="w-full bg-gray-50 border-0 rounded-2xl px-4 py-4 text-left flex items-center justify-between focus:outline-none"
              >
                <span className={selectedRole ? 'text-black' : 'text-gray-400'}>
                  {selectedRole ? `${selectedRole.icon} ${selectedRole.name}` : 'Select Role'}
                </span>
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </button>

              <AnimatePresence>
                {showRoleDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-2xl overflow-hidden z-10 shadow-lg"
                  >
                    {roles.map((role) => (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => {
                          setFormData({...formData, role: role.id});
                          setShowRoleDropdown(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 text-black"
                      >
                        <span className="text-2xl">{role.icon}</span>
                        <span>{role.name}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center ${
                    rememberMe ? 'bg-black border-black' : 'bg-white border-gray-300'
                  }`}
                  onClick={() => setRememberMe(!rememberMe)}
                >
                  {rememberMe && (
                    <motion.svg
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-4 h-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </motion.svg>
                  )}
                </div>
                <span className="text-sm text-black">Remember me</span>
              </label>
              <a href="#" className="text-sm text-black font-medium">Forgot password?</a>
            </div>

            {/* Error Message */}
            {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}

            {/* Sign In Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-4 bg-black text-white font-semibold rounded-2xl transition-all mt-6 disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </motion.button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-400">or continue with</span>
              </div>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="flex items-center justify-center gap-2 py-3 px-4 bg-gray-50 rounded-2xl text-black font-medium hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Google</span>
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2 py-3 px-4 bg-gray-50 rounded-2xl text-black font-medium hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/>
                </svg>
                <span>Apple</span>
              </button>
            </div>

            {/* Guest Login */}
            <button
              type="button"
              className="w-full py-3 bg-gray-50 rounded-2xl text-black font-medium hover:bg-gray-100 transition-colors"
            >
              Continue as Guest
            </button>

            {/* Biometric */}
            <div className="text-center mt-6">
              <p className="text-sm text-gray-400">🔐 Biometric login available</p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
