import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Layout } from './components/layout/Layout';
import type { View } from './components/layout/Sidebar';
import { TasksView } from './components/tasks/TasksView';
import { KanbanView } from './components/kanban/KanbanView';
import { DropdownsView } from './components/dropdowns/DropdownsView';
import { Spinner } from './components/ui/Spinner';
import { ModeBanner } from './components/layout/ModeBanner';
import { useBootstrap } from './hooks/useTasks';

export default function App() {
  const [view, setView] = useState<View>('tasks');
  const { data, isLoading, error } = useBootstrap();

  return (
    <Layout view={view} onChangeView={setView}>
      <div className="mb-3">
        <ModeBanner />
      </div>

      {isLoading && (
        <div className="flex h-64 items-center justify-center">
          <Spinner className="h-8 w-8 text-blue-500" />
        </div>
      )}

      {!isLoading && error && (
        <div className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <div className="font-semibold">Could not load any data.</div>
            <div className="mt-1 text-rose-600">{(error as Error).message}</div>
          </div>
        </div>
      )}

      {!isLoading && data && (
        <>
          {view === 'tasks' && (
            <TasksView
              tasks={data.tasks}
              projects={data.projects}
              labels={data.labels}
              users={data.users}
            />
          )}
          {view === 'kanban' && (
            <KanbanView
              tasks={data.tasks}
              projects={data.projects}
              labels={data.labels}
              users={data.users}
            />
          )}
          {view === 'dropdowns' && (
            <DropdownsView
              projects={data.projects}
              labels={data.labels}
              users={data.users}
            />
          )}
        </>
      )}
    </Layout>
  );
}
