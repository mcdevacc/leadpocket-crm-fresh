'use client'

import React, { useState, useEffect } from 'react';
import { Users, Plus, Home, MessageSquare, Mail, Settings, BarChart3, Search, Moon, Sun, Loader2 } from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  product_type: string;
  status: string;
  job_value: number;
  created_at: string;
}

const CRM = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLead, setNewLead] = useState({
    name: '', email: '', phone: '', product_type: 'shutters', job_value: 0
  });

  const organizationId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

  const productTypes = [
    { value: 'shutters', label: 'Shutters' },
    { value: 'blinds', label: 'Blinds' },
    { value: 'curtains', label: 'Curtains' }
  ];

  const statusOptions = [
    { value: 'new', label: 'New', color: 'bg-blue-500' },
    { value: 'contacted', label: 'Contacted', color: 'bg-yellow-500' },
    { value: 'won', label: 'Won', color: 'bg-green-500' }
  ];

  const themeClasses = {
    bg: darkMode ? 'bg-gray-900' : 'bg-gray-50',
    cardBg: darkMode ? 'bg-gray-800' : 'bg-white',
    text: darkMode ? 'text-white' : 'text-gray-900',
    textSecondary: darkMode ? 'text-gray-300' : 'text-gray-600',
    border: darkMode ? 'border-gray-700' : 'border-gray-200',
    sidebarBg: darkMode ? 'bg-gray-800' : 'bg-white'
  };

  const fetchLeads = async () => {
    try {
      const response = await fetch(`/api/leads?organizationId=${organizationId}`);
      if (response.ok) {
        const data = await response.json();
        setLeads(data);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
    }
  };

  const createLead = async () => {
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newLead,
          organizationId: organizationId,
          createdBy: 'demo-user'
        })
      });
      
      if (response.ok) {
        const newLeadData = await response.json();
        setLeads(prev => [newLeadData, ...prev]);
        setShowAddModal(false);
        setNewLead({ name: '', email: '', phone: '', product_type: 'shutters', job_value: 0 });
      }
    } catch (error) {
      console.error('Error creating lead:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchLeads();
      setLoading(false);
    };
    loadData();
  }, []);

  const formatCurrency = (value: number) => `£${value?.toLocaleString() || 0}`;

  if (loading) {
    return (
      <div className={`min-h-screen ${themeClasses.bg} flex items-center justify-center`}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className={themeClasses.text}>Loading CRM...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${themeClasses.bg} flex`}>
      {/* Sidebar */}
      <div className={`w-64 h-screen ${themeClasses.sidebarBg} border-r ${themeClasses.border} flex flex-col`}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">💼</div>
            <div>
              <h1 className={`text-xl font-bold ${themeClasses.text}`}>LeadPocket CRM</h1>
              <p className={`text-sm ${themeClasses.textSecondary}`}>Demo Company</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Home },
              { id: 'leads', label: 'Leads', icon: Users },
              { id: 'communications', label: 'Communications', icon: MessageSquare },
              { id: 'reports', label: 'Reports', icon: BarChart3 },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    activeTab === item.id 
                      ? 'bg-blue-600 text-white' 
                      : `${themeClasses.text} hover:bg-gray-100`
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
        
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${themeClasses.text} hover:bg-gray-100`}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <main className="h-screen overflow-y-auto">
          {activeTab === 'dashboard' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className={`text-2xl font-bold ${themeClasses.text}`}>Dashboard</h1>
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                  <Plus size={20} />
                  <span>Add Lead</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className={`${themeClasses.cardBg} p-6 rounded-lg shadow-sm border ${themeClasses.border}`}>
                  <h3 className={`text-lg font-semibold ${themeClasses.text} mb-2`}>Total Leads</h3>
                  <p className={`text-3xl font-bold ${themeClasses.text}`}>{leads.length}</p>
                </div>
                
                <div className={`${themeClasses.cardBg} p-6 rounded-lg shadow-sm border ${themeClasses.border}`}>
                  <h3 className={`text-lg font-semibold ${themeClasses.text} mb-2`}>Pipeline Value</h3>
                  <p className="text-3xl font-bold text-green-600">
                    {formatCurrency(leads.reduce((sum, lead) => sum + (lead.job_value || 0), 0))}
                  </p>
                </div>
                
                <div className={`${themeClasses.cardBg} p-6 rounded-lg shadow-sm border ${themeClasses.border}`}>
                  <h3 className={`text-lg font-semibold ${themeClasses.text} mb-2`}>Conversion Rate</h3>
                  <p className="text-3xl font-bold text-blue-600">12.5%</p>
                </div>
              </div>

              <div className={`${themeClasses.cardBg} p-6 rounded-lg shadow-sm border ${themeClasses.border}`}>
                <h3 className={`text-lg font-semibold ${themeClasses.text} mb-4`}>Recent Leads</h3>
                <div className="space-y-3">
                  {leads.slice(0, 5).map(lead => (
                    <div key={lead.id} className={`p-3 rounded-lg ${dar
