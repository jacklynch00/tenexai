'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'

interface Analysis {
  executive_summary: {
    total_annual_savings: number
    automation_potential_percentage: number
    payback_period_months: number
    implementation_complexity: string
  }
  task_breakdown: Array<{
    task_name: string
    description: string
    automation_potential: number
    estimated_time_savings_hours_per_week: number
    estimated_annual_savings: number
    automation_approach: string
    implementation_difficulty: string
  }>
  automation_workflow: {
    current_process: string[]
    automated_process: string[]
    ai_integration_points: string[]
  }
  roi_analysis: {
    current_annual_cost: number
    automation_implementation_cost: number
    annual_savings: number
    net_savings_year_1: number
    net_savings_year_3: number
    roi_percentage: number
  }
  implementation_roadmap: Array<{
    phase: string
    timeline: string
    tasks: string[]
    estimated_savings: number
    complexity: string
  }>
}

interface ResultsDashboardProps {
  analysis: Analysis
  onStartOver: () => void
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

export default function ResultsDashboard({ analysis, onStartOver }: ResultsDashboardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Prepare chart data
  const taskSavingsData = analysis.task_breakdown.map(task => ({
    name: task.task_name,
    savings: task.estimated_annual_savings,
    potential: task.automation_potential
  }))

  const roiProjectionData = [
    { year: 'Year 1', savings: analysis.roi_analysis.net_savings_year_1, cost: analysis.roi_analysis.automation_implementation_cost },
    { year: 'Year 2', savings: analysis.roi_analysis.annual_savings * 2 - analysis.roi_analysis.automation_implementation_cost, cost: 0 },
    { year: 'Year 3', savings: analysis.roi_analysis.net_savings_year_3, cost: 0 }
  ]

  const automationPotentialData = analysis.task_breakdown.map(task => ({
    name: task.task_name,
    value: task.automation_potential
  }))

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              AI Automation Analysis Results
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Comprehensive analysis of automation opportunities and ROI projections
            </p>
          </div>
          <button
            onClick={onStartOver}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-sm sm:text-base whitespace-nowrap"
          >
            Analyze Another Job
          </button>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Executive Summary</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="text-center bg-gray-50 p-4 rounded-lg">
            <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-2">
              {formatCurrency(analysis.executive_summary.total_annual_savings)}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Total Annual Savings</div>
          </div>
          <div className="text-center bg-gray-50 p-4 rounded-lg">
            <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">
              {analysis.executive_summary.automation_potential_percentage}%
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Automation Potential</div>
          </div>
          <div className="text-center bg-gray-50 p-4 rounded-lg">
            <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-2">
              {analysis.executive_summary.payback_period_months} months
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Payback Period</div>
          </div>
          <div className="text-center bg-gray-50 p-4 rounded-lg">
            <div className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getComplexityColor(analysis.executive_summary.implementation_complexity)}`}>
              {analysis.executive_summary.implementation_complexity} Complexity
            </div>
            <div className="text-xs sm:text-sm text-gray-600 mt-2">Implementation</div>
          </div>
        </div>
      </div>

      {/* Task Breakdown */}
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Task Breakdown & Automation Opportunities</h2>
        
        {/* Mobile Card View */}
        <div className="block sm:hidden space-y-4">
          {analysis.task_breakdown.map((task, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div>
                <h3 className="text-sm font-medium text-gray-900">{task.task_name}</h3>
                <p className="text-xs text-gray-500 mt-1">{task.description}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Automation Potential</span>
                  <span className="text-xs font-medium text-gray-900">{task.automation_potential}%</span>
                </div>
                <div className="bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${task.automation_potential}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-gray-600">Time Savings</span>
                  <p className="font-medium text-gray-900">{task.estimated_time_savings_hours_per_week}h/week</p>
                </div>
                <div>
                  <span className="text-gray-600">Annual Savings</span>
                  <p className="font-medium text-green-600">{formatCurrency(task.estimated_annual_savings)}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-gray-600">Approach</span>
                  <p className="font-medium text-gray-900">{task.automation_approach}</p>
                </div>
                <div>
                  <span className="text-gray-600">Difficulty</span>
                  <div className="mt-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getComplexityColor(task.implementation_difficulty)}`}>
                      {task.implementation_difficulty}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Automation Potential</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Savings</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Annual Savings</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approach</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analysis.task_breakdown.map((task, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{task.task_name}</div>
                    <div className="text-sm text-gray-500 hidden lg:block">{task.description}</div>
                  </td>
                  <td className="px-3 sm:px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${task.automation_potential}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{task.automation_potential}%</span>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 text-sm text-gray-900">
                    {task.estimated_time_savings_hours_per_week}h/week
                  </td>
                  <td className="px-3 sm:px-6 py-4 text-sm font-medium text-green-600">
                    {formatCurrency(task.estimated_annual_savings)}
                  </td>
                  <td className="px-3 sm:px-6 py-4 text-sm text-gray-900">
                    <div className="max-w-xs truncate">{task.automation_approach}</div>
                  </td>
                  <td className="px-3 sm:px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getComplexityColor(task.implementation_difficulty)}`}>
                      {task.implementation_difficulty}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Task Savings Chart */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Annual Savings by Task</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={taskSavingsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `$${value/1000}K`} />
              <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Annual Savings']} />
              <Bar dataKey="savings" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Automation Potential Chart */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Automation Potential by Task</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={automationPotentialData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {automationPotentialData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ROI Analysis */}
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">ROI Analysis</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Financial Overview</h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between text-sm sm:text-base">
                <span className="text-gray-600">Current Annual Cost:</span>
                <span className="font-semibold">{formatCurrency(analysis.roi_analysis.current_annual_cost)}</span>
              </div>
              <div className="flex justify-between text-sm sm:text-base">
                <span className="text-gray-600">Implementation Cost:</span>
                <span className="font-semibold text-red-600">{formatCurrency(analysis.roi_analysis.automation_implementation_cost)}</span>
              </div>
              <div className="flex justify-between text-sm sm:text-base">
                <span className="text-gray-600">Annual Savings:</span>
                <span className="font-semibold text-green-600">{formatCurrency(analysis.roi_analysis.annual_savings)}</span>
              </div>
              <div className="flex justify-between border-t pt-2 text-sm sm:text-base">
                <span className="text-gray-600">Net Savings (Year 1):</span>
                <span className="font-bold text-green-600">{formatCurrency(analysis.roi_analysis.net_savings_year_1)}</span>
              </div>
              <div className="flex justify-between text-sm sm:text-base">
                <span className="text-gray-600">Net Savings (Year 3):</span>
                <span className="font-bold text-green-600">{formatCurrency(analysis.roi_analysis.net_savings_year_3)}</span>
              </div>
              <div className="flex justify-between text-sm sm:text-base">
                <span className="text-gray-600">ROI Percentage:</span>
                <span className="font-bold text-blue-600">{analysis.roi_analysis.roi_percentage}%</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">3-Year Projection</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={roiProjectionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis tickFormatter={(value) => `$${value/1000}K`} />
                <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Net Savings']} />
                <Line type="monotone" dataKey="savings" stroke="#10B981" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Automation Workflow */}
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Automation Workflow</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Current Process</h3>
            <div className="space-y-3">
              {analysis.automation_workflow.current_process.map((step, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium">
                    {index + 1}
                  </div>
                  <span className="text-sm sm:text-base text-gray-700">{step}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Automated Process</h3>
            <div className="space-y-3">
              {analysis.automation_workflow.automated_process.map((step, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium">
                    {index + 1}
                  </div>
                  <span className="text-sm sm:text-base text-gray-700">{step}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="md:col-span-2 lg:col-span-1">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">AI Integration Points</h3>
            <div className="space-y-3">
              {analysis.automation_workflow.ai_integration_points.map((point, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                    AI
                  </div>
                  <span className="text-sm sm:text-base text-gray-700">{point}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Implementation Roadmap */}
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Implementation Roadmap</h2>
        <div className="space-y-4 sm:space-y-6">
          {analysis.implementation_roadmap.map((phase, index) => (
            <div key={index} className="border-l-4 border-blue-500 pl-4 sm:pl-6 pb-4 sm:pb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">{phase.phase}</h3>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                  <span className="text-xs sm:text-sm text-gray-600">{phase.timeline}</span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getComplexityColor(phase.complexity)}`}>
                    {phase.complexity}
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-green-600">
                    {formatCurrency(phase.estimated_savings)} savings
                  </span>
                </div>
              </div>
              <ul className="space-y-2">
                {phase.tasks.map((task, taskIndex) => (
                  <li key={taskIndex} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                    <span className="text-sm sm:text-base text-gray-700">{task}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}