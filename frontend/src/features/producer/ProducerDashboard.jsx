import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useMovie } from '../../context/MovieContext';
import { useNotifications } from '../../context/NotificationContext';
import { producerApi } from '../../api/producerApi';
import { authApi } from '../../api/authApi';
import { weatherApi } from '../../api/integrationsApi';
import { aiApi } from '../../api/aiApi';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { TalentProfileModal } from '../../components/modals/TalentProfileModal';
import { EditMovieModal } from '../../components/modals/EditMovieModal';
import { CreateAnnouncementModal } from '../../components/modals/CreateAnnouncementModal';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';
import {
  Briefcase,
  DollarSign,
  Calendar,
  Layers,
  CloudSun,
  AlertTriangle,
  Sparkles,
  Plus,
  TrendingUp,
  MapPin,
  Clock,
  CheckCircle2,
  Users,
  Film,
  FileText,
  Edit3,
  Trash2,
  Search,
  Filter,
  XCircle,
  X,
  Pencil,
  Megaphone
} from 'lucide-react';

const COLORS = ['#f59e0b', '#06b6d4', '#10b981', '#8b5cf6', '#f43f5e'];

export const ProducerDashboard = () => {
  const { user } = useAuth();
  const { activeMovie, movies, setActiveMovieId, deleteMovie, scenes = [], characters = [], refreshActiveMovieData, loading: movieLoading } = useMovie();
  const { showToast } = useNotifications();
  const location = useLocation();

  // Tab State: 'overview' | 'schedules' | 'finances' | 'departments' | 'weather'
  const [activeTab, setActiveTab] = useState('overview');

  const [selectedTalentForProfile, setSelectedTalentForProfile] = useState(null);
  const [isTalentModalOpen, setIsTalentModalOpen] = useState(false);
  const [isEditMovieModalOpen, setIsEditMovieModalOpen] = useState(false);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);

  const handleDeleteProduction = async () => {
    if (!activeMovie?.id) return;
    if (!window.confirm(`CRITICAL ACTION: Are you sure you want to permanently delete the production '${activeMovie.title}' and all its associated data from Firestore?`)) return;
    try {
      await deleteMovie(activeMovie.id);
      showToast(`Production '${activeMovie.title}' deleted successfully.`, "info");
    } catch (err) {
      alert(`Error deleting production: ${err.message}`);
    }
  };

  // Data state
  const [schedules, setSchedules] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [budgetBreakdown, setBudgetBreakdown] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLocation, setWeatherLocation] = useState('Los Angeles, CA');
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Forms / Modals
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [newExpense, setNewExpense] = useState({
    category: 'Production & Camera',
    department: 'Camera & Grip',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    vendor: '',
    status: 'APPROVED'
  });

  const [isDepartmentModalOpen, setIsDepartmentModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [newDepartment, setNewDepartment] = useState({
    name: '',
    headOfDepartment: '',
    budgetAllocated: '',
    budgetSpent: '',
    teamCount: '5',
    status: 'ACTIVE',
    taskSummary: ''
  });

  const [aiFixing, setAiFixing] = useState(false);

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [newSchedule, setNewSchedule] = useState({
    title: '',
    shootingDate: new Date().toISOString().split('T')[0],
    startTime: '08:00',
    endTime: '18:00',
    location: '',
    setting: 'INT',
    weatherRiskLevel: 'LOW',
    status: 'SCHEDULED',
    notes: ''
  });

  // Schedule Filters & Search
  const [scheduleSearch, setScheduleSearch] = useState('');
  const [scheduleStatusFilter, setScheduleStatusFilter] = useState('ALL');
  const [scheduleSettingFilter, setScheduleSettingFilter] = useState('ALL');

  // Schedule Location Weather Modal & Inspection State
  const [selectedScheduleForWeather, setSelectedScheduleForWeather] = useState(null);
  const [scheduleWeatherReport, setScheduleWeatherReport] = useState(null);
  const [loadingScheduleWeather, setLoadingScheduleWeather] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState(null);

  // AI Risk State
  const [aiRiskReport, setAiRiskReport] = useState(null);
  const [analyzingRisk, setAnalyzingRisk] = useState(false);

  // Screenplay Breakdown Filter State
  const [screenplaySearch, setScreenplaySearch] = useState('');
  const [screenplaySettingFilter, setScreenplaySettingFilter] = useState('ALL');

  const handleInspectScheduleWeather = async (sch) => {
    handleInspectLocationWeather(sch.location, sch.title || sch.sceneHeading, sch.shootingDate, sch.setting);
    if (sch.id) setSelectedScheduleId(sch.id);
  };

  const handleInspectLocationWeather = async (locationName, title = 'Filming Location', dateStr = null, setting = 'EXT') => {
    const loc = locationName || weatherLocation || 'Chennai, India';
    setSelectedScheduleForWeather({
      title: title || `Filming Location: ${loc}`,
      location: loc,
      shootingDate: dateStr || 'Upcoming Production Day',
      setting: setting || 'EXT'
    });
    setLoadingScheduleWeather(true);
    setScheduleWeatherReport(null);
    try {
      const wRes = await weatherApi.getWeather(loc, dateStr);
      setScheduleWeatherReport(wRes);
    } catch (err) {
      console.error("Location weather fetch error:", err);
      setScheduleWeatherReport({ available: false, error: "Failed to fetch location weather." });
    } finally {
      setLoadingScheduleWeather(false);
    }
  };

  // Synchronize location hash with tab selection
  useEffect(() => {
    if (location.hash) {
      const h = location.hash.replace('#', '');
      if (['overview', 'screenplay', 'schedules', 'finances', 'departments', 'weather'].includes(h)) {
        setActiveTab(h);
      } else if (h === 'budget') {
        setActiveTab('finances');
      }
    }
  }, [location.hash]);

  const changeTab = (tabId) => {
    setActiveTab(tabId);
    window.location.hash = tabId;
  };

  useEffect(() => {
    if (activeMovie?.id) {
      loadProducerData();
    }
  }, [activeMovie?.id]);

  const loadProducerData = async () => {
    setLoadingData(true);
    try {
      const [schedRes, expRes, budRes, depRes] = await Promise.all([
        producerApi.getSchedules(activeMovie.id),
        producerApi.getExpenses(activeMovie.id),
        producerApi.getBudgetBreakdown(activeMovie.id),
        producerApi.getDepartments(activeMovie.id)
      ]);

      setSchedules(schedRes || []);
      setExpenses(expRes || []);
      setBudgetBreakdown(budRes || null);
      setDepartments(depRes || []);

      // Determine initial location from first schedule if available
      const primaryLoc = (schedRes && schedRes.length > 0 && schedRes[0].location) ? schedRes[0].location : weatherLocation;
      setWeatherLocation(primaryLoc);
      fetchWeather(primaryLoc);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchWeather = async (loc) => {
    const targetLoc = loc || weatherLocation;
    if (!targetLoc) return;
    setWeatherLoading(true);
    try {
      const wthRes = await weatherApi.getWeather(targetLoc);
      setWeatherData(wthRes || null);
    } catch (err) {
      console.warn("Weather fetch error:", err);
      setWeatherData({ available: false, error: "Weather data unavailable." });
    } finally {
      setWeatherLoading(false);
    }
  };

  const handleRunAiFixProducerData = async () => {
    if (!activeMovie?.id) return;
    setAiFixing(true);
    try {
      await producerApi.aiGenerateAndFix(activeMovie.id);
      showToast("🤖 Producer AI Assistant analyzed movie details & fixed schedules, budget ledger & departments!", "success");
      loadProducerData();
    } catch (err) {
      alert(`AI Fix error: ${err.message}`);
    } finally {
      setAiFixing(false);
    }
  };

  const handleOpenCreateExpense = () => {
    setEditingExpense(null);
    setNewExpense({
      category: 'Production & Camera',
      department: 'Camera & Grip',
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      vendor: '',
      status: 'APPROVED'
    });
    setIsExpenseModalOpen(true);
  };

  const handleOpenEditExpense = (exp) => {
    setEditingExpense(exp);
    setNewExpense({
      category: exp.category || 'Production & Camera',
      department: exp.department || 'Camera & Grip',
      description: exp.description || '',
      amount: exp.amount || '',
      date: exp.date || new Date().toISOString().split('T')[0],
      vendor: exp.vendor || '',
      status: exp.status || 'APPROVED'
    });
    setIsExpenseModalOpen(true);
  };

  const handleSaveExpense = async (e) => {
    e.preventDefault();
    if (!newExpense.description || !newExpense.amount || !activeMovie?.id) return;
    try {
      if (editingExpense) {
        await producerApi.updateExpense(editingExpense.id, {
          ...newExpense,
          amount: parseFloat(newExpense.amount) || 0
        });
        showToast("💰 Ledger expense item updated!", "success");
      } else {
        await producerApi.logExpense({
          ...newExpense,
          amount: parseFloat(newExpense.amount) || 0,
          movieId: activeMovie.id,
          approvedBy: user?.name
        });
        showToast("💰 Production expense recorded in Firestore ledger!", "success");
      }
      setIsExpenseModalOpen(false);
      setEditingExpense(null);
      loadProducerData();
    } catch (err) {
      alert(`Expense error: ${err.message}`);
    }
  };

  const handleDeleteExpense = async (exp) => {
    if (!window.confirm(`Delete ledger expense line item "${exp.description}"?`)) return;
    try {
      await producerApi.deleteExpense(exp.id);
      showToast("🗑️ Expense line item deleted from ledger.", "info");
      loadProducerData();
    } catch (err) {
      alert(`Failed to delete expense: ${err.message}`);
    }
  };

  const handleOpenCreateDepartment = () => {
    setEditingDepartment(null);
    setNewDepartment({
      name: '',
      headOfDepartment: '',
      budgetAllocated: '',
      budgetSpent: '0',
      teamCount: '5',
      status: 'ACTIVE',
      taskSummary: ''
    });
    setIsDepartmentModalOpen(true);
  };

  const handleOpenEditDepartment = (d) => {
    setEditingDepartment(d);
    setNewDepartment({
      name: d.name || '',
      headOfDepartment: d.headOfDepartment || '',
      budgetAllocated: d.budgetAllocated || '',
      budgetSpent: d.budgetSpent || '',
      teamCount: d.teamCount || '5',
      status: d.status || 'ACTIVE',
      taskSummary: d.taskSummary || ''
    });
    setIsDepartmentModalOpen(true);
  };

  const handleSaveDepartment = async (e) => {
    e.preventDefault();
    if (!newDepartment.name || !activeMovie?.id) return;
    try {
      if (editingDepartment) {
        await producerApi.updateDepartment(editingDepartment.id, {
          ...newDepartment,
          budgetAllocated: parseFloat(newDepartment.budgetAllocated) || 0,
          budgetSpent: parseFloat(newDepartment.budgetSpent) || 0,
          teamCount: parseInt(newDepartment.teamCount, 10) || 1
        });
        showToast("🏢 Department details updated!", "success");
      } else {
        await producerApi.createDepartment({
          ...newDepartment,
          movieId: activeMovie.id,
          budgetAllocated: parseFloat(newDepartment.budgetAllocated) || 0,
          budgetSpent: parseFloat(newDepartment.budgetSpent) || 0,
          teamCount: parseInt(newDepartment.teamCount, 10) || 1
        });
        showToast("🏢 Department added to production roster!", "success");
      }
      setIsDepartmentModalOpen(false);
      setEditingDepartment(null);
      loadProducerData();
    } catch (err) {
      alert(`Department error: ${err.message}`);
    }
  };

  const handleDeleteDepartment = async (d) => {
    if (!window.confirm(`Delete department "${d.name}"?`)) return;
    try {
      await producerApi.deleteDepartment(d.id);
      showToast("🗑️ Department deleted.", "info");
      loadProducerData();
    } catch (err) {
      alert(`Failed to delete department: ${err.message}`);
    }
  };

  const handleOpenCreateSchedule = () => {
    setEditingSchedule(null);
    setNewSchedule({
      title: '',
      shootingDate: new Date().toISOString().split('T')[0],
      startTime: '08:00',
      endTime: '18:00',
      location: '',
      setting: 'INT',
      weatherRiskLevel: 'LOW',
      status: 'SCHEDULED',
      notes: ''
    });
    setIsScheduleModalOpen(true);
  };

  const handleOpenEditSchedule = (sch) => {
    setEditingSchedule(sch);
    setNewSchedule({
      title: sch.title || '',
      shootingDate: sch.shootingDate || new Date().toISOString().split('T')[0],
      startTime: sch.startTime || '08:00',
      endTime: sch.endTime || '18:00',
      location: sch.location || '',
      setting: sch.setting || 'INT',
      weatherRiskLevel: sch.weatherRiskLevel || 'LOW',
      status: sch.status || 'SCHEDULED',
      notes: sch.notes || ''
    });
    setIsScheduleModalOpen(true);
  };

  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    if (!newSchedule.title || !activeMovie?.id) return;
    try {
      if (editingSchedule) {
        await producerApi.updateSchedule(editingSchedule.id, newSchedule);
        showToast("📅 Shooting schedule call sheet updated!", "success");
      } else {
        await producerApi.createSchedule({ ...newSchedule, movieId: activeMovie.id });
        showToast("📅 Shooting schedule item created!", "success");
      }
      setIsScheduleModalOpen(false);
      setEditingSchedule(null);
      loadProducerData();
    } catch (err) {
      alert(`Schedule error: ${err.message}`);
    }
  };

  const handleQuickStatusChange = async (scheduleId, newStatus) => {
    try {
      await producerApi.updateSchedule(scheduleId, { status: newStatus });
      setSchedules((prev) =>
        prev.map((s) => (s.id === scheduleId ? { ...s, status: newStatus } : s))
      );
      showToast(`📅 Schedule status updated to ${newStatus}`, "success");
    } catch (err) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  const handleQuickDateChange = async (scheduleId, newDate) => {
    try {
      await producerApi.updateSchedule(scheduleId, { shootingDate: newDate });
      setSchedules((prev) =>
        prev.map((s) => (s.id === scheduleId ? { ...s, shootingDate: newDate } : s))
      );
      showToast(`📅 Shooting date changed to ${newDate}`, "success");
    } catch (err) {
      alert(`Failed to update shooting date: ${err.message}`);
    }
  };

  const handleDeleteSchedule = async (sch) => {
    if (!window.confirm(`Are you sure you want to delete call sheet "${sch.title}"?`)) return;
    try {
      await producerApi.deleteSchedule(sch.id);
      setSchedules((prev) => prev.filter((s) => s.id !== sch.id));
      showToast("🗑️ Call sheet deleted.", "info");
    } catch (err) {
      alert(`Failed to delete schedule: ${err.message}`);
    }
  };

  const handleRunAiRiskAnalysis = async () => {
    if (!activeMovie?.id) return;
    setAnalyzingRisk(true);
    try {
      const res = await aiApi.runProducerAi(activeMovie.id, "Evaluate weather threats against outdoor shooting schedules and recommend contingency plan.", true, 'WEATHER_CONTINGENCY');
      setAiRiskReport(res);
      showToast("⚠️ AI Schedule & Weather Risk Analysis generated!", "info");
    } catch (err) {
      alert(`Risk analysis error: ${err.message}`);
    } finally {
      setAnalyzingRisk(false);
    }
  };

  if (movieLoading) return <LoadingSkeleton count={3} />;

  if (!activeMovie) {
    return (
      <EmptyState
        icon={Briefcase}
        title="No Active Production"
        description="No productions yet. Create your first movie project to begin."
      />
    );
  }

  const totalSpent = expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const totalBudget = activeMovie.budget || 0;
  const burnPct = totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : 0;

  // Recharts Chart Data
  const chartData = budgetBreakdown?.categories?.map((c) => ({
    name: c.category,
    Allocated: c.allocated,
    Spent: c.spent
  })) || [];

  const hasChartData = chartData.length > 0 && chartData.some(c => c.Allocated > 0 || c.Spent > 0);

  // Filtered Shooting Schedules & Counters
  const filteredSchedules = schedules.filter((sch) => {
    const matchesSearch =
      !scheduleSearch ||
      sch.title?.toLowerCase().includes(scheduleSearch.toLowerCase()) ||
      sch.location?.toLowerCase().includes(scheduleSearch.toLowerCase()) ||
      sch.notes?.toLowerCase().includes(scheduleSearch.toLowerCase());
    const matchesStatus = scheduleStatusFilter === 'ALL' || sch.status === scheduleStatusFilter;
    const matchesSetting = scheduleSettingFilter === 'ALL' || sch.setting === scheduleSettingFilter;
    return matchesSearch && matchesStatus && matchesSetting;
  });

  const scheduledCount = schedules.filter((s) => s.status === 'SCHEDULED' || !s.status).length;
  const completedCount = schedules.filter((s) => s.status === 'COMPLETED').length;
  const delayedCount = schedules.filter((s) => s.status === 'DELAYED').length;
  const cancelledCount = schedules.filter((s) => s.status === 'CANCELLED').length;

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* 1. Producer Header & Key Metrics */}
      <div className="cinema-glass rounded-3xl p-6 sm:p-8 border border-amber-500/20 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] uppercase tracking-wider font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                EXECUTIVE PRODUCER SUITE
              </span>
              <span className="text-xs text-slate-400 font-medium">Producer: {user?.name}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-100 font-['Cinzel']">
              {activeMovie.title}
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl mt-1.5">
              Production Company: <strong className="text-amber-400">{activeMovie.productionCompany || 'Apex Pictures'}</strong> • Status: <span className="uppercase text-cyan-400 font-bold">{activeMovie.status}</span>
            </p>
          </div>

          {/* Quick Financial Overview */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-slate-900/80 border border-slate-800 px-4 py-3 rounded-2xl text-center min-w-[110px]">
              <p className="text-[10px] uppercase font-bold text-slate-400">Total Budget</p>
              <p className="text-lg font-black text-amber-400 font-['Outfit']">${(totalBudget / 1e6).toFixed(1)}M</p>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 px-4 py-3 rounded-2xl text-center min-w-[110px]">
              <p className="text-[10px] uppercase font-bold text-slate-400">Capital Spent</p>
              <p className="text-lg font-black text-emerald-400 font-['Outfit']">${(totalSpent / 1e6).toFixed(2)}M</p>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 px-4 py-3 rounded-2xl text-center min-w-[90px]">
              <p className="text-[10px] uppercase font-bold text-slate-400">Burn Rate</p>
              <p className="text-lg font-black text-cyan-400 font-['Outfit']">{burnPct}%</p>
            </div>
            <button
              onClick={async () => {
                try {
                  const users = await authApi.getUsers();
                  if (users && users.length > 0) {
                    const talent = users.find(u => u.role === 'ACTOR' || u.role === 'MUSIC_DIRECTOR') || users[0];
                    setSelectedTalentForProfile(talent);
                    setIsTalentModalOpen(true);
                  }
                } catch (e) {}
              }}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-200 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <Users className="w-4 h-4 text-cyan-400" />
              Browse Talent Profiles
            </button>

            {/* AI Assistant, Edit, Announcement & Delete Action Pills */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <button
                onClick={handleRunAiFixProducerData}
                disabled={aiFixing}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-cyan-400 hover:brightness-110 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-amber-500/20 disabled:opacity-50"
                title="Producer AI Assistant: Analyze movie details and fix schedules, budget, ledger & departments"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>{aiFixing ? "AI Fixing Data..." : "🤖 Producer AI: Fix Schedules & Ledger"}</span>
              </button>
              <button
                onClick={() => setIsAnnouncementModalOpen(true)}
                className="px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-amber-500/30 shadow-md"
                title="Dispatch Announcement to Crew"
              >
                <Megaphone className="w-3.5 h-3.5" />
                <span>Announcement</span>
              </button>
              <button
                onClick={() => setIsEditMovieModalOpen(true)}
                className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-amber-500/30 shadow-md"
                title="Edit Production Details"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
              <button
                onClick={handleDeleteProduction}
                className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-rose-500/20 text-rose-400 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-rose-500/30 shadow-md"
                title="Delete Production"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 pt-6 border-t border-slate-800/80 overflow-x-auto">
          <button
            onClick={() => changeTab('overview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'overview' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            Production Overview
          </button>

          <button
            onClick={() => changeTab('schedules')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'schedules' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Shooting Schedules ({schedules.length})
          </button>

          <button
            onClick={() => changeTab('finances')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'finances' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            Budget & Ledger ({expenses.length})
          </button>

          <button
            onClick={() => changeTab('departments')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'departments' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            Departments ({departments.length})
          </button>

          <button
            onClick={() => changeTab('weather')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'weather' ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <CloudSun className="w-4 h-4" />
            Weather Intelligence
          </button>
        </div>
      </div>

      {/* 2. TAB: PRODUCTION OVERVIEW & FINANCIAL CHARTS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top Row: Portfolio & Active Milestones */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Budget Utilization Breakdown Chart */}
            <div className="lg:col-span-2 cinema-glass rounded-2xl p-6 border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 font-['Outfit']">Budget Allocation vs Expenditure</h3>
                  <p className="text-xs text-slate-400">Departmental capital performance in real-time</p>
                </div>
                <button
                  onClick={() => setIsExpenseModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> Log Expense
                </button>
              </div>

              {hasChartData ? (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                      <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10 }} />
                      <YAxis stroke="#64748b" tickFormatter={(v) => `$${v / 1e6}M`} tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(value) => `$${value.toLocaleString()}`} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                      <Bar dataKey="Allocated" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Spent" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 w-full flex flex-col items-center justify-center border border-slate-800/80 rounded-2xl bg-slate-950/40 text-center p-6">
                  <DollarSign className="w-8 h-8 text-slate-500 mb-2" />
                  <p className="text-xs font-semibold text-slate-300">Not enough data to display this chart yet.</p>
                  <p className="text-[11px] text-slate-500 mt-1">Log production expenses to populate departmental allocations in real-time.</p>
                </div>
              )}
            </div>

            {/* Weather & Schedule Risk Widget */}
            <div className="cinema-glass rounded-2xl p-6 border border-cyan-500/20 flex flex-col justify-between">
              {weatherData && weatherData.available !== false && !weatherData.error ? (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">OPENWEATHER INTEL</span>
                    <span className="text-xs font-semibold text-slate-400">{weatherData.location || weatherLocation}</span>
                  </div>
                  <h4 className="text-xl font-black text-slate-100 font-['Outfit']">
                    {weatherData.temperatureC}°C ({weatherData.temperatureF}°F)
                  </h4>
                  <p className="text-xs text-amber-300 font-semibold mt-0.5">{weatherData.condition} — {weatherData.description}</p>
                  <div className="mt-4 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-400">Rain Probability:</span>
                      <strong className="text-cyan-400">{weatherData.rainProbability}%</strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-400">Wind Velocity:</span>
                      <strong>{weatherData.windSpeedKmh} km/h</strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-400">Production Threat:</span>
                      <strong className={weatherData.productionRisk === 'HIGH' ? 'text-rose-500' : 'text-emerald-400'}>
                        {weatherData.productionRisk}
                      </strong>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <CloudSun className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-300">Weather data unavailable.</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{weatherLocation}</p>
                  <button
                    onClick={() => fetchWeather(weatherLocation)}
                    className="mt-3 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-slate-950 border border-cyan-500/30 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Retry
                  </button>
                </div>
              )}

              <button
                onClick={handleRunAiRiskAnalysis}
                disabled={analyzingRisk}
                className="mt-6 w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-amber-500 hover:from-cyan-400 hover:to-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <Sparkles className="w-4 h-4" />
                {analyzingRisk ? "Analyzing Schedule Threat..." : "Run AI Schedule Risk Analysis"}
              </button>
            </div>
          </div>

          {/* AI Risk Alert Banner if triggered */}
          {aiRiskReport && (
            <div className="cinema-glass rounded-2xl p-6 border border-amber-500/40 bg-amber-500/5 animate-in slide-in-from-top">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-amber-300 font-['Outfit']">{aiRiskReport.title}</h4>
                  <p className="text-xs text-slate-200 mt-1.5 leading-relaxed whitespace-pre-line">{aiRiskReport.analysis}</p>
                  {aiRiskReport.recommendations?.length > 0 && (
                    <div className="mt-3 space-y-1">
                      <p className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">AI Producer Recommendations:</p>
                      {aiRiskReport.recommendations.map((r, i) => (
                        <div key={i} className="text-xs text-slate-300 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> {r}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. TAB: SHOOTING SCHEDULES */}
      {activeTab === 'schedules' && (
        <div className="space-y-6">
          {/* Top Callout Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 cinema-glass p-6 rounded-2xl border border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-100 font-['Outfit']">Principal Photography Call Sheets & Day Shoots</h3>
              <p className="text-xs text-slate-400 mt-1">Track & edit shooting dates, locations, INT/EXT lighting, crew logistics, and live status</p>

              {/* Stats Pills */}
              <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 font-medium">
                  Total Call Sheets: <strong className="text-white">{schedules.length}</strong>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 font-medium">
                  Scheduled: <strong>{scheduledCount}</strong>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-medium">
                  Completed: <strong>{completedCount}</strong>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 font-medium">
                  Delayed: <strong>{delayedCount}</strong>
                </span>
                {cancelledCount > 0 && (
                  <span className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 font-medium">
                    Cancelled: <strong>{cancelledCount}</strong>
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={handleOpenCreateSchedule}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-amber-500/10 shrink-0 self-start md:self-auto"
            >
              <Plus className="w-4 h-4" /> Add Call Sheet
            </button>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 cinema-glass p-3 rounded-xl border border-slate-800/80">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by call sheet title, location, or notes..."
                value={scheduleSearch}
                onChange={(e) => setScheduleSearch(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none"
              />
              {scheduleSearch && (
                <button
                  onClick={() => setScheduleSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Pill Groups */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Status Filter */}
              <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800">
                {['ALL', 'SCHEDULED', 'COMPLETED', 'DELAYED', 'CANCELLED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setScheduleStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                      scheduleStatusFilter === st
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Setting Filter */}
              <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800">
                {['ALL', 'INT', 'EXT'].map((set) => (
                  <button
                    key={set}
                    onClick={() => setScheduleSettingFilter(set)}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                      scheduleSettingFilter === set
                        ? 'bg-cyan-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {set}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          {filteredSchedules.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSchedules.map((sch) => {
                const isCompleted = sch.status === 'COMPLETED';
                const isDelayed = sch.status === 'DELAYED';
                const isCancelled = sch.status === 'CANCELLED';

                const isSelected = selectedScheduleId === sch.id;

                return (
                  <div
                    key={sch.id}
                    onClick={() => handleInspectScheduleWeather(sch)}
                    className={`cinema-glass rounded-2xl p-6 border transition-all flex flex-col justify-between group cursor-pointer ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-950/20 shadow-xl shadow-cyan-500/10 ring-1 ring-cyan-400/50'
                        : isCompleted
                        ? 'border-emerald-500/30 hover:border-emerald-500/60 bg-emerald-950/10'
                        : isDelayed
                        ? 'border-amber-500/40 hover:border-amber-500/80 bg-amber-950/10'
                        : isCancelled
                        ? 'border-rose-500/30 hover:border-rose-500/60 opacity-75'
                        : 'border-slate-800 hover:border-cyan-500/40'
                    }`}
                  >
                    <div>
                      {/* Card Top: Editable Date & Action Buttons */}
                      <div className="flex items-center justify-between mb-3 gap-2">
                        {/* Quick Date Picker */}
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-lg px-2 py-1 text-slate-200"
                        >
                          <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <input
                            type="date"
                            value={sch.shootingDate || ''}
                            onChange={(e) => handleQuickDateChange(sch.id, e.target.value)}
                            title="Click to reschedule shooting date"
                            className="bg-transparent text-[11px] font-bold text-amber-400 focus:outline-none cursor-pointer"
                          />
                        </div>

                        {/* Setting & Weather Risk & Actions */}
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              sch.setting === 'EXT'
                                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                                : 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                            }`}
                          >
                            {sch.setting}
                          </span>

                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              sch.weatherRiskLevel === 'HIGH'
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse'
                                : sch.weatherRiskLevel === 'MEDIUM'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {sch.weatherRiskLevel} RISK
                          </span>

                          {/* Edit Button */}
                          <button
                            onClick={() => handleOpenEditSchedule(sch)}
                            title="Edit call sheet details"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteSchedule(sch)}
                            title="Delete call sheet"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Call Sheet Title */}
                      <h4 className="text-base font-bold text-slate-100 font-['Outfit'] leading-snug">
                        {sch.title}
                      </h4>

                      {/* Location & Time & Weather Report Trigger */}
                      <div className="mt-2.5 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs text-slate-200 font-semibold flex items-center gap-1.5 truncate">
                            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span className="truncate">{sch.location || 'Location Unspecified'}</span>
                          </p>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleInspectScheduleWeather(sch);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-slate-950 border border-cyan-500/30 text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 shadow-sm shrink-0"
                            title={`Inspect live location weather report for ${sch.location}`}
                          >
                            <CloudSun className="w-3.5 h-3.5" />
                            <span>Weather Report</span>
                          </button>
                        </div>

                        <p className="text-xs text-slate-400 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span>{sch.startTime || '08:00'} - {sch.endTime || '18:00'}</span>
                        </p>
                      </div>

                      {/* Notes */}
                      {sch.notes && (
                        <p className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 mt-3 italic leading-relaxed">
                          "{sch.notes}"
                        </p>
                      )}
                    </div>

                    {/* Card Footer: Quick Status Switcher */}
                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-medium text-slate-400">Status:</span>
                        <select
                          value={sch.status || 'SCHEDULED'}
                          onChange={(e) => handleQuickStatusChange(sch.id, e.target.value)}
                          className={`text-xs font-bold px-2 py-1 rounded-lg border focus:outline-none cursor-pointer ${
                            isCompleted
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                              : isDelayed
                              ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                              : isCancelled
                              ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                              : 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                          }`}
                        >
                          <option value="SCHEDULED" className="bg-slate-900 text-slate-100">SCHEDULED</option>
                          <option value="COMPLETED" className="bg-slate-900 text-slate-100">COMPLETED</option>
                          <option value="DELAYED" className="bg-slate-900 text-slate-100">DELAYED</option>
                          <option value="CANCELLED" className="bg-slate-900 text-slate-100">CANCELLED</option>
                        </select>
                      </div>

                      <span className="text-[11px] text-amber-400 font-semibold">
                        {sch.charactersNeeded?.length || 0} Cast Req
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="cinema-glass rounded-2xl border border-slate-800 p-12 text-center">
              <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h4 className="text-base font-bold text-slate-200 font-['Outfit']">No Shooting Schedules Found</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                {scheduleSearch || scheduleStatusFilter !== 'ALL' || scheduleSettingFilter !== 'ALL'
                  ? 'No call sheets match your active filter criteria. Try resetting filters or searching for another keyword.'
                  : 'No call sheets have been scheduled for this movie yet. Click below to create your first shooting schedule.'}
              </p>
              <div className="mt-4 flex items-center justify-center gap-3">
                {(scheduleSearch || scheduleStatusFilter !== 'ALL' || scheduleSettingFilter !== 'ALL') && (
                  <button
                    onClick={() => {
                      setScheduleSearch('');
                      setScheduleStatusFilter('ALL');
                      setScheduleSettingFilter('ALL');
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Reset Filters
                  </button>
                )}
                <button
                  onClick={handleOpenCreateSchedule}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4 inline mr-1" /> Add Call Sheet
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. TAB: FINANCES & EXPENSE LEDGER */}
      {activeTab === 'finances' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 cinema-glass p-4 sm:p-6 rounded-2xl border border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-100 font-['Outfit']">Production General Ledger & Purchase Orders</h3>
              <p className="text-xs text-slate-400 mt-0.5">Real-time audited transaction history persisted in Firestore — fully editable & deletable</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleRunAiFixProducerData}
                disabled={aiFixing}
                className="px-3.5 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{aiFixing ? "Fixing..." : "AI Auto-Fix Ledger"}</span>
              </button>
              <button
                onClick={handleOpenCreateExpense}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" /> Log Purchase Order
              </button>
            </div>
          </div>

          <div className="cinema-glass rounded-2xl border border-slate-800 overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4 font-bold">Date</th>
                  <th className="p-4 font-bold">Description</th>
                  <th className="p-4 font-bold">Department</th>
                  <th className="p-4 font-bold">Category</th>
                  <th className="p-4 font-bold">Vendor</th>
                  <th className="p-4 font-bold text-right">Amount ($)</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {expenses.length > 0 ? (
                  expenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 text-slate-400 font-mono">{exp.date}</td>
                      <td className="p-4 font-bold text-slate-100">{exp.description}</td>
                      <td className="p-4 text-amber-400">{exp.department}</td>
                      <td className="p-4 text-slate-300">{exp.category}</td>
                      <td className="p-4 text-slate-400">{exp.vendor || 'Direct Purchase'}</td>
                      <td className="p-4 text-right font-bold text-emerald-400 font-mono">
                        ${(exp.amount || 0).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {exp.status || 'APPROVED'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEditExpense(exp)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Edit ledger line item"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteExpense(exp)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Delete ledger line item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-500">
                      No general ledger expenses recorded yet. Click "Log Purchase Order" or run AI Auto-Fix above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. TAB: DEPARTMENTS */}
      {activeTab === 'departments' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 cinema-glass p-4 sm:p-6 rounded-2xl border border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-100 font-['Outfit']">Production Department Roster & Budget Allocations</h3>
              <p className="text-xs text-slate-400 mt-0.5">Manage department leads, crew size, capital allocation, and expenditures</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleRunAiFixProducerData}
                disabled={aiFixing}
                className="px-3.5 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{aiFixing ? "Fixing..." : "AI Auto-Fix Departments"}</span>
              </button>
              <button
                onClick={handleOpenCreateDepartment}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" /> Add Department
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.length > 0 ? (
              departments.map((d) => (
                <div key={d.id} className="cinema-glass rounded-2xl p-6 border border-slate-800 flex flex-col justify-between group hover:border-amber-500/30 transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-base font-bold text-slate-100 font-['Outfit']">{d.name}</h4>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {d.status || 'ACTIVE'}
                        </span>
                        <button
                          onClick={() => handleOpenEditDepartment(d)}
                          className="p-1 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Edit department details"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteDepartment(d)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Delete department"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-amber-400 font-semibold">Head: {d.headOfDepartment || 'Unassigned'}</p>
                    <p className="text-[11px] text-slate-400 mt-1">{d.taskSummary || 'Core film unit operation'}</p>

                    <div className="mt-4 p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Crew Size:</span>
                        <strong className="text-slate-200">{d.teamCount || 1} Specialists</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Allocated Budget:</span>
                        <strong className="text-slate-200">${((d.budgetAllocated || 0) / 1e6).toFixed(2)}M</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Spent to Date:</span>
                        <strong className="text-emerald-400">${((d.budgetSpent || 0) / 1e6).toFixed(2)}M</strong>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full cinema-glass rounded-2xl border border-slate-800 p-8 text-center text-slate-500">
                No production departments created yet. Click "Add Department" or use AI Auto-Fix above.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. TAB: WEATHER INTELLIGENCE */}
      {activeTab === 'weather' && (
        <div className="cinema-glass rounded-3xl p-8 border border-cyan-500/30 max-w-4xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <h3 className="text-lg font-bold text-slate-100 font-['Outfit']">OpenWeather Production Forecasting</h3>
              <p className="text-xs text-slate-400 mt-0.5">Real-time meteorological risk evaluation for exterior film locations worldwide</p>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                fetchWeather(weatherLocation);
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={weatherLocation}
                onChange={(e) => setWeatherLocation(e.target.value)}
                placeholder="City, Country or Shooting Location"
                className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none min-w-[200px]"
              />
              <button
                type="submit"
                disabled={weatherLoading}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer shrink-0 disabled:opacity-50"
              >
                {weatherLoading ? "Fetching..." : "Fetch Weather"}
              </button>
            </form>
          </div>

          {/* Preset Location Quick Pills */}
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">QUICK TEST GLOBAL FILM HUBS:</p>
            <div className="flex flex-wrap items-center gap-2">
              {[
                "London", "Los Angeles", "Tokyo", "Mumbai", "Paris",
                "New York", "Sydney", "Vancouver", "Rome", "Toronto"
              ].map((city) => (
                <button
                  key={city}
                  onClick={() => {
                    setWeatherLocation(city);
                    fetchWeather(city);
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    weatherLocation.toLowerCase().includes(city.toLowerCase())
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                      : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  📍 {city}
                </button>
              ))}
            </div>
          </div>

          {weatherLoading ? (
            <div className="py-12 text-center text-slate-400 text-xs animate-pulse">
              <CloudSun className="w-10 h-10 text-cyan-400 mx-auto mb-2 animate-bounce" />
              Retrieving live OpenWeather meteorological telemetry for '{weatherLocation}'...
            </div>
          ) : weatherData && weatherData.available !== false && !weatherData.error ? (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between bg-slate-900/60 p-3 px-4 rounded-xl border border-slate-800">
                <span className="text-xs font-bold text-slate-200">
                  Target Location: <strong className="text-cyan-400">{weatherData.location}</strong>
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                  Source: {weatherData.source || 'OpenWeather API'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 text-center">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Current Temperature</p>
                  <p className="text-3xl font-black text-amber-400 font-['Outfit'] mt-1">{weatherData.temperatureC}°C</p>
                  <p className="text-xs text-slate-400 mt-0.5">{weatherData.temperatureF}°F</p>
                </div>
                <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 text-center">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Precipitation & Sky</p>
                  <p className="text-3xl font-black text-cyan-400 font-['Outfit'] mt-1">{weatherData.rainProbability}%</p>
                  <p className="text-xs text-slate-300 mt-0.5 font-semibold">{weatherData.condition} ({weatherData.description})</p>
                </div>
                <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 text-center">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Filming Safety Threat</p>
                  <p className={`text-3xl font-black font-['Outfit'] mt-1 ${weatherData.productionRisk === 'HIGH' ? 'text-rose-500 animate-pulse' : weatherData.productionRisk === 'MEDIUM' ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {weatherData.productionRisk} RISK
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{weatherData.windSpeedKmh} km/h Wind | {weatherData.humidity}% Humidity</p>
                </div>
              </div>

              {/* Risk Factors */}
              {weatherData.riskFactors?.length > 0 && (
                <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <p className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">ENVIRONMENTAL RISK EVALUATION FACTORS:</p>
                  <div className="space-y-1">
                    {weatherData.riskFactors.map((rf, idx) => (
                      <div key={idx} className="text-xs text-slate-300 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                        <span>{rf}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {weatherData.recommendation && (
                <div className={`p-5 rounded-2xl border transition-all ${
                  (weatherData.shootDecision === 'POSTPONE SHOOT' || weatherData.productionRisk === 'HIGH' || weatherData.rainProbability > 40)
                    ? 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                    : weatherData.shootDecision === 'PROCEED WITH CAUTION' || weatherData.productionRisk === 'MEDIUM'
                    ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                    : 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                }`}>
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">PRODUCER WEATHER ADVISORY & SHOOT DECISION</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border shadow-md ${
                      (weatherData.shootDecision === 'POSTPONE SHOOT' || weatherData.productionRisk === 'HIGH' || weatherData.rainProbability > 40)
                        ? 'bg-rose-500 text-white border-rose-400 animate-pulse'
                        : weatherData.shootDecision === 'PROCEED WITH CAUTION' || weatherData.productionRisk === 'MEDIUM'
                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold'
                        : 'bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold'
                    }`}>
                      {(weatherData.shootDecision === 'POSTPONE SHOOT' || weatherData.productionRisk === 'HIGH' || weatherData.rainProbability > 40) ? (
                        <>
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          <span>🚫 POSTPONE SHOOT</span>
                        </>
                      ) : weatherData.shootDecision === 'PROCEED WITH CAUTION' || weatherData.productionRisk === 'MEDIUM' ? (
                        <>
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          <span>⚠️ PROCEED WITH CAUTION</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span>✅ PROCEED WITH SHOOT</span>
                        </>
                      )}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed font-medium mt-1">{weatherData.recommendation}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-3">
              <CloudSun className="w-12 h-12 text-slate-500 mx-auto" />
              <h4 className="text-base font-bold text-slate-200 font-['Outfit']">Weather Data Unavailable</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Unable to retrieve real meteorological forecast for '{weatherLocation}'. Please check spelling or select one of the global city presets above.
              </p>
              <button
                onClick={() => fetchWeather(weatherLocation)}
                className="mt-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal: Add / Edit Expense */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="cinema-glass rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-amber-500/30 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100 font-['Outfit']">
                {editingExpense ? 'Edit Production Expense Entry' : 'Record Production Expense'}
              </h3>
              <button
                onClick={() => {
                  setIsExpenseModalOpen(false);
                  setEditingExpense(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Expense Description *</label>
                <input
                  type="text"
                  required
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  placeholder="e.g. ARRI Alexa 35 Camera Package Rental"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Amount ($ USD) *</label>
                  <input
                    type="number"
                    required
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
                  <select
                    value={newExpense.department}
                    onChange={(e) => setNewExpense({ ...newExpense, department: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="Camera & Grip">Camera & Grip</option>
                    <option value="Art & Set Construction">Art & Set Construction</option>
                    <option value="Costume & Wardrobe">Costume & Wardrobe</option>
                    <option value="Visual Effects (VFX)">Visual Effects (VFX)</option>
                    <option value="Sound & Music Score">Sound & Music Score</option>
                    <option value="Production & Logistics">Production & Logistics</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Vendor / Payee</label>
                  <input
                    type="text"
                    value={newExpense.vendor || ''}
                    onChange={(e) => setNewExpense({ ...newExpense, vendor: e.target.value })}
                    placeholder="e.g. Panavision Rentals"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <input
                    type="text"
                    value={newExpense.category || ''}
                    onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                    placeholder="e.g. Equipment Rental"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Invoice Date</label>
                  <input
                    type="date"
                    value={newExpense.date || ''}
                    onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                  <select
                    value={newExpense.status || 'APPROVED'}
                    onChange={(e) => setNewExpense({ ...newExpense, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="APPROVED">APPROVED</option>
                    <option value="PENDING">PENDING</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsExpenseModalOpen(false);
                    setEditingExpense(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-xs text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow-md transition-colors"
                >
                  {editingExpense ? 'Save Expense Changes' : 'Record Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add / Edit Department */}
      {isDepartmentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="cinema-glass rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-amber-500/30 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100 font-['Outfit']">
                {editingDepartment ? 'Edit Department Allocation' : 'Create Department Allocation'}
              </h3>
              <button
                onClick={() => {
                  setIsDepartmentModalOpen(false);
                  setEditingDepartment(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDepartment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Department Name *</label>
                <input
                  type="text"
                  required
                  value={newDepartment.name}
                  onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
                  placeholder="e.g. Camera & Grip"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Head of Department (HOD)</label>
                <input
                  type="text"
                  value={newDepartment.headOfDepartment || ''}
                  onChange={(e) => setNewDepartment({ ...newDepartment, headOfDepartment: e.target.value })}
                  placeholder="e.g. Marcus Vance"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Budget Allocated ($)</label>
                  <input
                    type="number"
                    value={newDepartment.budgetAllocated || 0}
                    onChange={(e) => setNewDepartment({ ...newDepartment, budgetAllocated: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Budget Spent ($)</label>
                  <input
                    type="number"
                    value={newDepartment.budgetSpent || 0}
                    onChange={(e) => setNewDepartment({ ...newDepartment, budgetSpent: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Crew / Team Size</label>
                  <input
                    type="number"
                    value={newDepartment.teamCount || 1}
                    onChange={(e) => setNewDepartment({ ...newDepartment, teamCount: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                  <select
                    value={newDepartment.status || 'ACTIVE'}
                    onChange={(e) => setNewDepartment({ ...newDepartment, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="PAUSED">PAUSED</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Task Summary / Focus</label>
                <textarea
                  rows={2}
                  value={newDepartment.taskSummary || ''}
                  onChange={(e) => setNewDepartment({ ...newDepartment, taskSummary: e.target.value })}
                  placeholder="e.g. Camera package rig & daily lens telemetry"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsDepartmentModalOpen(false);
                    setEditingDepartment(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-xs text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow-md transition-colors"
                >
                  {editingDepartment ? 'Save Department Changes' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add / Edit Schedule */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="cinema-glass rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-amber-500/30 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100 font-['Outfit']">
                {editingSchedule ? 'Edit Shooting Call Sheet' : 'Create Shooting Call Sheet'}
              </h3>
              <button
                onClick={() => {
                  setIsScheduleModalOpen(false);
                  setEditingSchedule(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSchedule} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Call Sheet Title *</label>
                <input
                  type="text"
                  required
                  value={newSchedule.title}
                  onChange={(e) => setNewSchedule({ ...newSchedule, title: e.target.value })}
                  placeholder="e.g. Day 12: Sector 9 Alleyway Water Tank Shoot"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Shooting Date *</label>
                  <input
                    type="date"
                    required
                    value={newSchedule.shootingDate}
                    onChange={(e) => setNewSchedule({ ...newSchedule, shootingDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Setting</label>
                  <select
                    value={newSchedule.setting}
                    onChange={(e) => setNewSchedule({ ...newSchedule, setting: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="INT">INT (Interior Soundstage)</option>
                    <option value="EXT">EXT (Exterior Location)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={newSchedule.startTime || '08:00'}
                    onChange={(e) => setNewSchedule({ ...newSchedule, startTime: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">End Time</label>
                  <input
                    type="time"
                    value={newSchedule.endTime || '18:00'}
                    onChange={(e) => setNewSchedule({ ...newSchedule, endTime: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Shooting Location</label>
                <input
                  type="text"
                  value={newSchedule.location}
                  onChange={(e) => setNewSchedule({ ...newSchedule, location: e.target.value })}
                  placeholder="e.g. Pinewood Stage 4"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Weather Risk Level</label>
                  <select
                    value={newSchedule.weatherRiskLevel || 'LOW'}
                    onChange={(e) => setNewSchedule({ ...newSchedule, weatherRiskLevel: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="LOW">LOW RISK</option>
                    <option value="MEDIUM">MEDIUM RISK</option>
                    <option value="HIGH">HIGH RISK</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Schedule Status</label>
                  <select
                    value={newSchedule.status || 'SCHEDULED'}
                    onChange={(e) => setNewSchedule({ ...newSchedule, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="SCHEDULED">SCHEDULED</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="DELAYED">DELAYED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Logistical Notes / Requirements</label>
                <textarea
                  rows={3}
                  value={newSchedule.notes || ''}
                  onChange={(e) => setNewSchedule({ ...newSchedule, notes: e.target.value })}
                  placeholder="e.g. Rain machine required. Stunt double on standby."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsScheduleModalOpen(false);
                    setEditingSchedule(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-xs text-slate-300 hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow-md transition-colors"
                >
                  {editingSchedule ? 'Save Changes' : 'Create Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Live Schedule Location Weather Report */}
      {selectedScheduleForWeather && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="cinema-glass rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-cyan-500/40 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded border border-cyan-500/20">
                  LIVE LOCATION WEATHER TELEMETRY
                </span>
                <h3 className="text-lg font-bold text-slate-100 font-['Outfit'] mt-1">
                  {selectedScheduleForWeather.title}
                </h3>
                <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{selectedScheduleForWeather.location || 'Location Unspecified'}</span>
                  <span className="text-slate-600">•</span>
                  <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>{selectedScheduleForWeather.shootingDate}</span>
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedScheduleForWeather(null);
                  setScheduleWeatherReport(null);
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-6 space-y-6">
              {loadingScheduleWeather ? (
                <div className="py-12 text-center text-slate-400 text-xs animate-pulse">
                  <CloudSun className="w-10 h-10 text-cyan-400 mx-auto mb-2 animate-bounce" />
                  Retrieving live OpenWeather report for '{selectedScheduleForWeather.location}'...
                </div>
              ) : scheduleWeatherReport && scheduleWeatherReport.available !== false && !scheduleWeatherReport.error ? (
                <div className="space-y-5 animate-in fade-in">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 text-center">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Temperature</p>
                      <p className="text-2xl font-black text-amber-400 font-['Outfit'] mt-1">
                        {scheduleWeatherReport.temperatureC}°C
                      </p>
                      <p className="text-[11px] text-slate-400">{scheduleWeatherReport.temperatureF}°F</p>
                    </div>

                    <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 text-center">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Precipitation</p>
                      <p className="text-2xl font-black text-cyan-400 font-['Outfit'] mt-1">
                        {scheduleWeatherReport.rainProbability}%
                      </p>
                      <p className="text-[11px] text-slate-300 font-semibold">{scheduleWeatherReport.condition}</p>
                    </div>

                    <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 text-center">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Filming Safety</p>
                      <p className={`text-2xl font-black font-['Outfit'] mt-1 ${
                        scheduleWeatherReport.productionRisk === 'HIGH'
                          ? 'text-rose-500 animate-pulse'
                          : scheduleWeatherReport.productionRisk === 'MEDIUM'
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}>
                        {scheduleWeatherReport.productionRisk} RISK
                      </p>
                      <p className="text-[11px] text-slate-400">{scheduleWeatherReport.windSpeedKmh} km/h</p>
                    </div>
                  </div>

                  <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80 space-y-2">
                    <div className="flex justify-between text-xs text-slate-300">
                      <span className="text-slate-400">Weather Condition:</span>
                      <strong>{scheduleWeatherReport.description}</strong>
                    </div>
                    <div className="flex justify-between text-xs text-slate-300">
                      <span className="text-slate-400">Atmospheric Humidity:</span>
                      <strong>{scheduleWeatherReport.humidity}%</strong>
                    </div>
                    <div className="flex justify-between text-xs text-slate-300">
                      <span className="text-slate-400">Wind Velocity:</span>
                      <strong>{scheduleWeatherReport.windSpeedKmh} km/h</strong>
                    </div>
                    <div className="flex justify-between text-xs text-slate-300">
                      <span className="text-slate-400">Lighting Setting:</span>
                      <strong className={selectedScheduleForWeather.setting === 'EXT' ? 'text-cyan-400' : 'text-purple-300'}>
                        {selectedScheduleForWeather.setting === 'EXT' ? 'EXT (Exterior Shoot - Weather Vulnerable)' : 'INT (Interior Soundstage - Weather Shielded)'}
                      </strong>
                    </div>
                  </div>

                  {scheduleWeatherReport.riskFactors?.length > 0 && (
                    <div className="bg-amber-500/5 p-4 rounded-2xl border border-amber-500/20 space-y-2">
                      <p className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">ENVIRONMENTAL RISK FACTORS:</p>
                      <div className="space-y-1">
                        {scheduleWeatherReport.riskFactors.map((rf, idx) => (
                          <div key={idx} className="text-xs text-slate-300 flex items-center gap-2">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>{rf}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {scheduleWeatherReport.recommendation && (
                    <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-200">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 mb-1">PRODUCER FILMING RECOMMENDATION</p>
                      <p className="leading-relaxed">{scheduleWeatherReport.recommendation}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
                  <CloudSun className="w-10 h-10 text-slate-500 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-200">Weather Report Unavailable</h4>
                  <p className="text-xs text-slate-400">
                    Unable to fetch weather data for '{selectedScheduleForWeather.location}'.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => {
                  setSelectedScheduleForWeather(null);
                  setScheduleWeatherReport(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow-md transition-colors"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Talent Profile Modal */}
      <TalentProfileModal
        isOpen={isTalentModalOpen}
        onClose={() => setIsTalentModalOpen(false)}
        talent={selectedTalentForProfile}
        onDispatchOffer={(talentItem) => {
          showToast(`Offer request dispatched for ${talentItem.name}!`, "success");
        }}
      />

      {/* Edit Movie Details Modal */}
      <EditMovieModal
        isOpen={isEditMovieModalOpen}
        onClose={() => setIsEditMovieModalOpen(false)}
        movie={activeMovie}
      />

      {/* Crew Announcement Modal */}
      <CreateAnnouncementModal
        isOpen={isAnnouncementModalOpen}
        onClose={() => setIsAnnouncementModalOpen(false)}
      />
    </div>
  );
};
