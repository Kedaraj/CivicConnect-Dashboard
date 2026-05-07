import { MessageSquare, User, MapPin, Clock, ThumbsUp, ThumbsDown, Send, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { toast } from 'sonner';

export function ComplaintsPage() {
  const [filter, setFilter] = useState('All');
  const [complaints, setComplaints] = useState([
    { id: 1, citizen: 'John Doe', issue: 'Traffic Signal Not Working', location: 'Main St & 2nd Ave', time: '10 min ago', priority: 'high', status: 'new' },
    { id: 2, citizen: 'Jane Smith', issue: 'Illegal Parking Blocking Driveway', location: 'Oak Street 123', time: '25 min ago', priority: 'medium', status: 'reviewing' },
    { id: 3, citizen: 'Mike Johnson', issue: 'Reckless Driving Reported', location: 'Highway 101', time: '1 hour ago', priority: 'high', status: 'new' },
    { id: 4, citizen: 'Sarah Williams', issue: 'Pothole Causing Traffic Hazard', location: 'Park Avenue', time: '2 hours ago', priority: 'low', status: 'assigned' }
  ]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return { bg: '#FFE5E5', text: '#FF4444' };
      case 'medium': return { bg: '#FFF5E5', text: '#FFA500' };
      case 'low': return { bg: '#E5E5FF', text: '#6B6BFF' };
      default: return { bg: '#F5F5F5', text: '#666666' };
    }
  };

  const handleAccept = (id: number) => {
    setComplaints(prev => prev.map(c =>
      c.id === id ? { ...c, status: 'reviewing' } : c
    ));
    toast.success('Complaint accepted for review');
  };

  const handleReject = (id: number) => {
    setComplaints(prev => prev.filter(c => c.id !== id));
    toast.success('Complaint rejected');
  };

  const handleAssign = (id: number) => {
    setComplaints(prev => prev.map(c =>
      c.id === id ? { ...c, status: 'assigned' } : c
    ));
    toast.success('Complaint assigned to officer');
  };

  const filteredComplaints = complaints.filter(c => {
    if (filter === 'All') return true;
    if (filter === 'New') return c.status === 'new';
    if (filter === 'Reviewing') return c.status === 'reviewing';
    if (filter === 'Assigned') return c.status === 'assigned';
    return true;
  });

  return (
    <div className="pb-24 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-xl font-bold text-black flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-blue-600" />
              Live Complaints
            </h2>
            <p className="text-gray-500 text-sm mt-1">Real-time citizen reports</p>
          </div>
          <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <Filter className="w-5 h-5 text-black" />
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {['All', 'New', 'Reviewing', 'Assigned'].map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap font-medium transition-colors ${
                filter === filterOption
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-black hover:bg-gray-200'
              }`}
            >
              {filterOption}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="p-4 grid grid-cols-3 gap-3">
        {[
          { label: 'New', value: complaints.filter(c => c.status === 'new').length, color: '#FF4444', bg: '#FFE5E5' },
          { label: 'Reviewing', value: complaints.filter(c => c.status === 'reviewing').length, color: '#FFA500', bg: '#FFF5E5' },
          { label: 'Assigned', value: complaints.filter(c => c.status === 'assigned').length, color: '#44CC44', bg: '#E5FFE5' }
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-3 text-center">
            <div className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
            <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Complaints Feed */}
      <div className="px-4 space-y-3">
        <AnimatePresence>
          {filteredComplaints.map((complaint, i) => {
            const colors = getPriorityColor(complaint.priority);
            return (
              <motion.div
                key={complaint.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
              >
                {/* Priority Indicator */}
                <div className="h-1" style={{ backgroundColor: colors.text }} />

                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-black font-semibold">{complaint.citizen}</h3>
                          <span
                            className="px-2 py-0.5 rounded-full text-xs"
                            style={{ backgroundColor: colors.bg, color: colors.text }}
                          >
                            {complaint.priority}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                          <Clock className="w-3 h-3" />
                          <span>{complaint.time}</span>
                        </div>
                      </div>
                    </div>
                    {complaint.status === 'new' && (
                      <motion.span
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="px-2 py-1 rounded-full bg-red-50 text-xs text-red-600 font-medium"
                      >
                        NEW
                      </motion.span>
                    )}
                  </div>

                  {/* Complaint Details */}
                  <div className="mb-3">
                    <p className="text-black text-sm mb-2">{complaint.issue}</p>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span>{complaint.location}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleAccept(complaint.id)}
                      disabled={complaint.status !== 'new'}
                      className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
                        complaint.status === 'new'
                          ? 'bg-green-50 text-green-600 hover:bg-green-100'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span>Accept</span>
                    </button>
                    <button
                      onClick={() => handleReject(complaint.id)}
                      className="flex items-center justify-center gap-2 py-2 bg-red-50 rounded-lg text-red-600 text-sm font-medium hover:bg-red-100 transition-colors"
                    >
                      <ThumbsDown className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => handleAssign(complaint.id)}
                      disabled={complaint.status === 'new'}
                      className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
                        complaint.status !== 'new'
                          ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <Send className="w-4 h-4" />
                      <span>Assign</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredComplaints.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">No {filter.toLowerCase()} complaints</div>
            <div className="text-gray-400 text-sm">All caught up!</div>
          </div>
        )}
      </div>
    </div>
  );
}
