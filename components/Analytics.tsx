import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export function Analytics() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const projects = useQuery(api.projects.getUserProjects);
  const analytics = useQuery(
    api.analytics.getProjectAnalytics,
    selectedProjectId ? { projectId: selectedProjectId as Id<"projects"> } : "skip"
  );

  if (!projects) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
        <p className="text-gray-600">Project insights and team productivity metrics</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Project
        </label>
        <select
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
          className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Choose a project...</option>
          {projects.filter((project): project is NonNullable<typeof project> => Boolean(project)).map((project) => (
            <option key={project._id} value={project._id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      {analytics && (
        <div className="space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Tasks"
              value={analytics.totalTasks}
              icon="📋"
              color="blue"
            />
            <StatCard
              title="Completion Rate"
              value={`${analytics.completionRate}%`}
              icon="✅"
              color="green"
            />
            <StatCard
              title="Overdue Tasks"
              value={analytics.overdueTasks}
              icon="⚠️"
              color="red"
            />
            <StatCard
              title="Recent Activity"
              value={analytics.recentActivityCount}
              icon="📈"
              color="yellow"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Task Status Distribution */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Task Status Distribution</h2>
              <div className="space-y-3">
                {Object.entries(analytics.statusCounts).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className="capitalize text-gray-700">
                      {status.replace('_', ' ')}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            status === 'completed' ? 'bg-green-500' :
                            status === 'in_progress' ? 'bg-blue-500' :
                            status === 'review' ? 'bg-yellow-500' :
                            'bg-gray-400'
                          }`}
                          style={{
                            width: analytics.totalTasks > 0 
                              ? `${(count / analytics.totalTasks) * 100}%`
                              : '0%'
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Priority Distribution */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Priority Distribution</h2>
              <div className="space-y-3">
                {Object.entries(analytics.priorityCounts).map(([priority, count]) => (
                  <div key={priority} className="flex items-center justify-between">
                    <span className="capitalize text-gray-700">{priority}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            priority === 'high' ? 'bg-red-500' :
                            priority === 'medium' ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{
                            width: analytics.totalTasks > 0 
                              ? `${(count / analytics.totalTasks) * 100}%`
                              : '0%'
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Time Tracking */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Time Tracking</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {analytics.timeTracking.estimated}h
                </div>
                <div className="text-sm text-gray-600">Estimated</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {analytics.timeTracking.actual}h
                </div>
                <div className="text-sm text-gray-600">Actual</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${
                  analytics.timeTracking.variance > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {analytics.timeTracking.variance > 0 ? '+' : ''}{analytics.timeTracking.variance}h
                </div>
                <div className="text-sm text-gray-600">Variance</div>
              </div>
            </div>
          </div>

          {/* Activity Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Activity (Last 7 Days)</h2>
            <div className="flex items-end gap-2 h-32">
              {analytics.activityByDay.map((day, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="bg-blue-500 w-full rounded-t"
                    style={{
                      height: `${Math.max((day.count / Math.max(...analytics.activityByDay.map(d => d.count), 1)) * 100, 5)}%`
                    }}
                  ></div>
                  <div className="text-xs text-gray-600 mt-2">
                    {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
                  </div>
                  <div className="text-xs font-medium">{day.count}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Team Productivity */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Team Productivity</h2>
            <div className="space-y-3">
              {analytics.memberProductivity.map((member) => (
                <div key={member.userId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium">{member.name}</div>
                      <div className="text-sm text-gray-600 capitalize">{member.role}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{member.completedTasks}</div>
                    <div className="text-sm text-gray-600">completed tasks</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!selectedProjectId && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a project</h3>
          <p className="text-gray-600">Choose a project above to view detailed analytics</p>
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: 'blue' | 'green' | 'red' | 'yellow';
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    red: 'bg-red-50 text-red-700',
    yellow: 'bg-yellow-50 text-yellow-700',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          <span className="text-xl">{icon}</span>
        </div>
      </div>
    </div>
  );
}
