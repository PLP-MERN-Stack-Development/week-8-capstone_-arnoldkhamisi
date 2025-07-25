import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { Dashboard } from "./components/Dashboard";
import { ProjectList } from "./components/ProjectList";
import { TaskBoard } from "./components/TaskBoard";
import { Analytics } from "./components/Analytics";
import { useState } from "react";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Toaster />
      <Authenticated>
        <MainApp />
      </Authenticated>
      <Unauthenticated>
        <LandingPage />
      </Unauthenticated>
    </div>
  );
}

function LandingPage() {
  return (
    <>
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm h-16 flex justify-between items-center border-b shadow-sm px-4">
        <h2 className="text-xl font-semibold text-blue-600">TaskFlow</h2>
      </header>
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-blue-600 mb-4">TaskFlow</h1>
            <p className="text-xl text-gray-600 mb-2">Collaborative Task Management</p>
            <p className="text-gray-500">Organize projects, track progress, and collaborate with your team in real-time</p>
          </div>
          <SignInForm />
        </div>
      </main>
    </>
  );
}

function MainApp() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'projects' | 'tasks' | 'analytics'>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm h-16 flex justify-between items-center border-b shadow-sm px-4">
        <div className="flex items-center gap-6">
          <h2 className="text-xl font-semibold text-blue-600">TaskFlow</h2>
          <nav className="flex gap-4">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`px-3 py-1 rounded-md transition-colors ${
                currentView === 'dashboard' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setCurrentView('projects')}
              className={`px-3 py-1 rounded-md transition-colors ${
                currentView === 'projects' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Projects
            </button>
            <button
              onClick={() => setCurrentView('analytics')}
              className={`px-3 py-1 rounded-md transition-colors ${
                currentView === 'analytics' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Analytics
            </button>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            Welcome, {loggedInUser?.name || loggedInUser?.email}
          </span>
          <SignOutButton />
        </div>
      </header>

      <main className="flex-1 p-6">
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'projects' && (
          <ProjectList 
            onSelectProject={(projectId) => {
              setSelectedProjectId(projectId);
              setCurrentView('tasks');
            }}
          />
        )}
        {currentView === 'tasks' && selectedProjectId && (
          <TaskBoard 
            projectId={selectedProjectId}
            onBack={() => setCurrentView('projects')}
          />
        )}
        {currentView === 'analytics' && <Analytics />}
      </main>
    </>
  );
}
