'use client';

import React, { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { useSidebarStore } from '@/store/sidebarStore';
import { useNotificationStore, InAppNotification } from '@/store/notificationStore';
import { useModalStore } from '@/store/modalStore';
import { useNotifications, useMarkAllNotificationsRead, useMarkNotificationRead } from '@/hooks/useNotifications';
import dynamic from 'next/dynamic';

const CreateProjectModal = dynamic(() => import('@/components/modals/CreateProjectModal').then(mod => mod.CreateProjectModal), { ssr: false });
const EditProjectModal = dynamic(() => import('@/components/modals/EditProjectModal').then(mod => mod.EditProjectModal), { ssr: false });
const CreateTaskModal = dynamic(() => import('@/components/modals/CreateTaskModal').then(mod => mod.CreateTaskModal), { ssr: false });
const EditTaskModal = dynamic(() => import('@/components/modals/EditTaskModal').then(mod => mod.EditTaskModal), { ssr: false });
const AddMemberModal = dynamic(() => import('@/components/modals/AddMemberModal').then(mod => mod.AddMemberModal), { ssr: false });
import { SearchBar } from '@/components/common/SearchBar';
import { useFilterStore } from '@/store/filterStore';
import { useTheme } from 'next-themes';
import {
  Menu,
  ChevronLeft,
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  LineChart,
  Bell,
  LogOut,
  Sun,
  Moon,
  Laptop,
  Check,
  User,
  Info,
  X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session } = useSession();
  const currentUser = session?.user;
  const router = useRouter();
  const pathname = usePathname();

  const { theme, setTheme } = useTheme();
  const { isOpen: sidebarOpen, toggle: toggleSidebar } = useSidebarStore();
  const { toasts, removeToast, addToast, liveNotifications, addLiveNotification, setLiveNotifications } = useNotificationStore();
  const { searchQuery, setSearchQuery } = useFilterStore();
  const { openModal } = useModalStore();

  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // TanStack Query alerts hooks
  const { data: serverNotifications = [] } = useNotifications();
  const markAllReadMutation = useMarkAllNotificationsRead();
  const markReadMutation = useMarkNotificationRead();

  // 1. Sync live notifications with database list on mount/update
  useEffect(() => {
    if (serverNotifications.length > 0) {
      setLiveNotifications(serverNotifications);
    }
  }, [serverNotifications, setLiveNotifications]);

  // 2. Configure Socket.IO real-time notification listener
  useEffect(() => {
    if (!currentUser?.id) return;

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
    const socket: Socket = io(socketUrl);

    socket.on('connect', () => {
      console.log('[Socket.IO]: Connected to notification server');
      socket.emit('join_user', currentUser.id);
    });

    // Handle live alert payload
    socket.on('notification_received', (note: InAppNotification) => {
      addLiveNotification(note);
      addToast(note.message, 'info');
    });

    return () => {
      socket.disconnect();
    };
  }, [currentUser?.id, addLiveNotification, addToast]);

  const handleMarkAllAsRead = async () => {
    try {
      await markAllReadMutation.mutateAsync();
      addToast('All notifications marked as read', 'success');
      setNotifDropdownOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkOneRead = async (id: string) => {
    try {
      await markReadMutation.mutateAsync(id);
    } catch (err) {
      console.error(err);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const menuItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Projects', path: '/projects', icon: FolderKanban },
    { label: 'Tasks', path: '/tasks', icon: CheckSquare },
    { label: 'Team Members', path: '/team', icon: Users },
    { label: 'Analytics', path: '/analytics', icon: LineChart },
  ];

  const unreadCount = liveNotifications.filter((n) => !n.read).length;

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 font-sans text-zinc-900 transition-colors dark:bg-black dark:text-zinc-50">
      
      {/* SIDEBAR NAVIGATION PANEL */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-zinc-200 bg-white transition-all duration-300 dark:border-zinc-800 dark:bg-zinc-950 lg:static ${
          sidebarOpen ? 'w-64' : 'w-20 -translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-zinc-100 dark:border-zinc-900">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="">
              <Image width={80} height={70} alt='logo' src={"/logoSc.png"} unoptimized/>
            </div>
            {sidebarOpen && (
              <span className="text-sm font-bold tracking-tight text-zinc-900 truncate dark:text-zinc-50">
                CollabWorkspace
              </span>
            )}
          </div>
          {sidebarOpen && (
            <button
              onClick={toggleSidebar}
              className="hidden rounded-lg p-1 text-zinc-400 hover:bg-zinc-50 lg:block dark:hover:bg-zinc-900"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`group flex items-center gap-3.5 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900 ${
                  isActive
                    ? 'bg-violet-50/50 text-violet-600 dark:bg-violet-950/20 dark:text-violet-400'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-violet-600 dark:text-violet-400' : 'text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300'}`} />
                {sidebarOpen && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer (Theme toggle & Profile brief) */}
        <div className="border-t border-zinc-150 p-4 space-y-4 dark:border-zinc-900">
          {/* Theme switcher */}
          <div className={`flex items-center justify-between ${sidebarOpen ? 'px-2' : 'justify-center'}`}>
            {sidebarOpen && <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Theme</span>}
            <div className="flex rounded-lg bg-zinc-100 p-0.5 dark:bg-zinc-900">
              <button
                onClick={() => setTheme('light')}
                className={`rounded-md p-1.5 transition-colors ${theme === 'light' ? 'bg-white text-zinc-800 shadow-xs dark:bg-zinc-800' : 'text-zinc-400 hover:text-zinc-600'}`}
                title="Light Mode"
              >
                <Sun className="h-4 w-4" />
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`rounded-md p-1.5 transition-colors ${theme === 'dark' ? 'bg-white text-zinc-800 shadow-xs dark:bg-zinc-800' : 'text-zinc-400 hover:text-zinc-600'}`}
                title="Dark Mode"
              >
                <Moon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setTheme('system')}
                className={`rounded-md p-1.5 transition-colors ${theme === 'system' ? 'bg-white text-zinc-800 shadow-xs dark:bg-zinc-800' : 'text-zinc-400 hover:text-zinc-600'}`}
                title="System Theme"
              >
                <Laptop className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Profile briefly */}
          {sidebarOpen && currentUser && (
            <div className="flex items-center gap-3 px-2 py-1.5">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-full overflow-hidden bg-zinc-100 text-xs font-semibold text-zinc-600 uppercase border border-zinc-200 dark:border-zinc-850 dark:bg-zinc-800 dark:text-zinc-300">
                {currentUser.avatarUrl ? (
                  <Image
                    src={currentUser.avatarUrl}
                    alt={currentUser.name || 'User'}
                    width={32}
                    height={32}
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                ) : (
                  <span>{getInitials(currentUser.name || '')}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-zinc-800 truncate dark:text-zinc-200">
                  {currentUser.name}
                </p>
                <p className="text-4xs text-zinc-400 truncate uppercase tracking-wider font-semibold">
                  {currentUser.role.replace('_', ' ')}
                </p>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT SHELL */}
      <div className="flex flex-1 flex-col overflow-hidden">
        
        {/* HEADER PANEL */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-6 shadow-2xs dark:border-zinc-800 dark:bg-zinc-950">
          
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="rounded-lg p-1 text-zinc-500 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-900"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            {/* Global Search Bar linking search queries to filterStore */}
            <div className="hidden sm:block">
              <SearchBar
                value={searchQuery}
                onChange={(val) => {
                  setSearchQuery(val);
                  // Redirect to tasks page to show filtered search if they type and are on a different page
                  if (pathname !== '/tasks' && pathname !== '/projects' && val) {
                    router.push('/tasks');
                  }
                }}
                placeholder="Global search projects or tasks..."
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Bell Badge */}
            <div className="relative">
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="relative rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-900"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-3xs font-extrabold text-white animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown list */}
              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-xl border border-zinc-200 bg-white py-2 shadow-xl dark:border-zinc-800 dark:bg-zinc-950 z-50">
                  <div className="flex items-center justify-between border-b border-zinc-100 px-4 pb-2 dark:border-zinc-900">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-4xs font-bold uppercase tracking-wider text-violet-600 hover:underline dark:text-violet-400"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  <div className="max-h-60 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-900">
                    {liveNotifications.length === 0 ? (
                      <div className="py-8 text-center text-xs text-zinc-400">
                        No notifications.
                      </div>
                    ) : (
                      liveNotifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => handleMarkOneRead(notif.id)}
                          className={`flex gap-2.5 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 cursor-pointer ${
                            !notif.read ? 'bg-zinc-50/50 dark:bg-zinc-900/10' : ''
                          }`}
                        >
                          <Info className={`h-4.5 w-4.5 shrink-0 ${!notif.read ? 'text-violet-500' : 'text-zinc-400'}`} />
                          <div className="min-w-0 flex-1">
                            <p className={`text-2xs text-zinc-700 dark:text-zinc-300 leading-relaxed ${!notif.read ? 'font-semibold' : ''}`}>
                              {notif.message}
                            </p>
                            <span className="text-4xs text-zinc-400 block mt-0.5">
                              {new Date(notif.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            {currentUser && (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="relative flex h-8 w-8 items-center justify-center rounded-full overflow-hidden bg-zinc-100 text-xs font-semibold text-zinc-600 uppercase border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 hover:scale-105 transition-all"
                >
                  {currentUser.avatarUrl ? (
                    <Image
                      src={currentUser.avatarUrl}
                      alt={currentUser.name || 'User'}
                      width={32}
                      height={32}
                      className="h-full w-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <span>{getInitials(currentUser.name || '')}</span>
                  )}
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl border border-zinc-200 bg-white py-1.5 shadow-xl dark:border-zinc-800 dark:bg-zinc-950 z-50">
                    <div className="px-4 py-2 border-b border-zinc-100 dark:border-zinc-900">
                      <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">{currentUser.name}</p>
                      <p className="text-3xs text-zinc-400 truncate">{currentUser.email}</p>
                    </div>
                    <button
                      onClick={() => signOut({ redirect: true, callbackUrl: '/login' })}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {/* PAGE BODY VIEW */}
        <main className="flex-1 overflow-y-auto px-6 py-8 md:px-8">
          {children}
        </main>
      </div>

      {/* FLOATING TOAST ALERTS PANELS */}
      <div className="fixed bottom-6 right-6 z-50 space-y-3 w-80">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-start justify-between rounded-xl border p-4 shadow-lg animate-slide-in ${
              toast.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400'
                : toast.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400'
                : toast.type === 'warning'
                ? 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-400'
                : 'bg-zinc-50 border-zinc-200 text-zinc-800 dark:bg-zinc-900/50 dark:border-zinc-800 dark:text-zinc-300'
            }`}
          >
            <div className="flex gap-2.5">
              <Info className="h-4.5 w-4.5 shrink-0 mt-0.5" />
              <p className="text-xs font-medium leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-4 shrink-0 rounded-lg p-0.5 text-zinc-400 hover:bg-zinc-200/50 hover:text-zinc-600 dark:hover:bg-zinc-800"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* GLOBAL MODALS PORTS */}
      <CreateProjectModal />
      <EditProjectModal />
      <CreateTaskModal />
      <EditTaskModal />
      <AddMemberModal />
    </div>
  );
}
