import Link from 'next/link';
import { 
  Zap, 
  ArrowRight, 
  Workflow, 
  Database, 
  Filter, 
  Send,
  Settings,
  Plus,
} from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Nexus Gateway</span>
            </div>
            <nav className="flex items-center gap-2">
              <Link
                href="/sender-apps/list"
                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
                Sources
              </Link>
              <Link
                href="/destinations/list"
                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <Database className="w-4 h-4" />
                Destinations
              </Link>
              <Link
                href="/workflow/list"
                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <Workflow className="w-4 h-4" />
                Workflows
              </Link>
              <Link
                href="/workflow"
                className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Workflow
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
            Connect, Transform &<br />
            <span className="text-indigo-400">Integrate Your Data</span>
          </h1>
          <p className="text-xl text-slate-400 mb-8">
            Build powerful data pipelines with visual workflows. 
            No coding required, just drag, drop, and connect.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/workflow"
              className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/25"
            >
              Open Workflow Editor
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/sender-apps"
              className="inline-flex items-center gap-2 px-6 py-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl border border-slate-700 transition-all duration-200 hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              Add Source
            </Link>
            <Link
              href="/destinations"
              className="inline-flex items-center gap-2 px-6 py-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl border border-slate-700 transition-all duration-200 hover:scale-105"
            >
              <Database className="w-5 h-5" />
              Add Destination
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto w-full">
          <FeatureCard
            icon={<Workflow className="w-6 h-6 text-blue-400" />}
            iconBg="bg-blue-500/20"
            title="Visual Editor"
            description="Build complex workflows with an intuitive drag-and-drop interface"
          />
          <FeatureCard
            icon={<Send className="w-6 h-6 text-purple-400" />}
            iconBg="bg-purple-500/20"
            title="Sender Apps"
            description="Configure custom data sources with API key authentication"
          />
          <FeatureCard
            icon={<Database className="w-6 h-6 text-emerald-400" />}
            iconBg="bg-emerald-500/20"
            title="Destinations"
            description="Connect to MySQL and PostgreSQL databases"
          />
          <FeatureCard
            icon={<Filter className="w-6 h-6 text-amber-400" />}
            iconBg="bg-amber-500/20"
            title="Transform Data"
            description="Filter, merge, and transform data with powerful logic nodes"
          />
        </div>
      </section>

      {/* Quick Actions */}
      <section className="border-t border-slate-800 bg-slate-900/30 px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-lg font-semibold text-white mb-6 text-center">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/sender-apps"
              className="group p-5 bg-slate-900 rounded-xl border border-slate-800 hover:border-purple-500/50 transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors">
                  <Send className="w-5 h-5 text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white group-hover:text-purple-400 transition-colors text-sm">
                    New Source
                  </h3>
                  <p className="text-xs text-slate-400 truncate">
                    Add sender app
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/destinations"
              className="group p-5 bg-slate-900 rounded-xl border border-slate-800 hover:border-emerald-500/50 transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/20 rounded-lg group-hover:bg-emerald-500/30 transition-colors">
                  <Database className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white group-hover:text-emerald-400 transition-colors text-sm">
                    New Destination
                  </h3>
                  <p className="text-xs text-slate-400 truncate">
                    Add database
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/workflow"
              className="group p-5 bg-slate-900 rounded-xl border border-slate-800 hover:border-blue-500/50 transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                  <Workflow className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors text-sm">
                    New Workflow
                  </h3>
                  <p className="text-xs text-slate-400 truncate">
                    Build pipeline
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/workflow/list"
              className="group p-5 bg-slate-900 rounded-xl border border-slate-800 hover:border-indigo-500/50 transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-500/20 rounded-lg group-hover:bg-indigo-500/30 transition-colors">
                  <Settings className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white group-hover:text-indigo-400 transition-colors text-sm">
                    Workflows
                  </h3>
                  <p className="text-xs text-slate-400 truncate">
                    View all pipelines
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 px-6 py-6">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-sm text-slate-500">
            Built with Next.js, @xyflow/react, and Tailwind CSS
          </p>
        </div>
      </footer>
    </main>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
}

function FeatureCard({ icon, iconBg, title, description }: FeatureCardProps) {
  return (
    <div className="p-6 bg-slate-900 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
      <div className={`p-3 ${iconBg} rounded-lg w-fit mb-4`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400">{description}</p>
    </div>
  );
}
