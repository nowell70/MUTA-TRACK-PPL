import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  CheckCircle2,
  Clock,
  Play,
  Pause,
  XCircle,
  Terminal,
  RefreshCw,
  FastForward,
  ChevronRight,
  BarChart2,
  FileCode,
  ShieldCheck,
  Cpu,
  Copy,
  Check,
} from 'lucide-react';
import { AnalysisJob, PipelineStageId, StageExecution } from '../../types';
import { STAGE_DESCRIPTIONS, createGeneratedVariantsForSample, createMetricsForSample } from '../../utils/pipelineSimulator';

interface MonitoringViewProps {
  job: AnalysisJob;
  onUpdateJob: (updatedJob: AnalysisJob) => void;
  onViewResults: (jobId: string) => void;
  onCancelJob: (jobId: string) => void;
}

export const MonitoringView: React.FC<MonitoringViewProps> = ({
  job,
  onUpdateJob,
  onViewResults,
  onCancelJob,
}) => {
  const [isPaused, setIsPaused] = useState(job.status === 'Paused');
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1); // 1x, 3x, or 10x
  const [selectedStageId, setSelectedStageId] = useState<PipelineStageId | 'all'>('all');
  const [copiedLog, setCopiedLog] = useState(false);
  const logTerminalEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    logTerminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [job.logs.length]);

  // Simulation timer for active running job
  useEffect(() => {
    if (job.status !== 'Running' || isPaused) return;

    const intervalMs = Math.max(400, Math.floor(1600 / speedMultiplier));
    const timer = setInterval(() => {
      const currentIdx = job.currentStageIndex;
      if (currentIdx >= job.stages.length) {
        return;
      }

      const stage = job.stages[currentIdx];
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

      // Progress increments by 15-25%
      const stepIncrement = Math.floor(15 + Math.random() * 15);
      const newProgress = Math.min(100, stage.progress + stepIncrement);

      // Check if stage should advance
      if (newProgress >= 100) {
        // Complete current stage
        const updatedStages = job.stages.map((st, i) => {
          if (i === currentIdx) {
            return {
              ...st,
              status: 'completed' as const,
              progress: 100,
              completedAt: timeStr,
            };
          }
          if (i === currentIdx + 1) {
            return {
              ...st,
              status: 'running' as const,
              progress: 10,
              startedAt: timeStr,
            };
          }
          return st;
        });

        // Stage description log
        const stageInfo = STAGE_DESCRIPTIONS[stage.id];
        const randomLog =
          stageInfo?.logs[Math.floor(Math.random() * (stageInfo.logs.length || 1))] ||
          `${stage.name} finished processing.`;

        const newLogs = [
          ...job.logs,
          {
            id: `log-${Date.now()}-done`,
            timestamp: timeStr,
            level: 'SUCCESS' as const,
            stage: stage.name,
            message: `[${stage.tool}] Stage complete. ${randomLog}`,
          },
        ];

        // Is this the final stage?
        if (currentIdx + 1 >= job.stages.length) {
          // Finish entire pipeline!
          const completedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
            2,
            '0'
          )}-${String(now.getDate()).padStart(2, '0')} ${timeStr}`;

          const finalJob: AnalysisJob = {
            ...job,
            status: 'Completed',
            completedAt: completedDate,
            stages: updatedStages,
            currentStageIndex: currentIdx,
            logs: [
              ...newLogs,
              {
                id: `log-${Date.now()}-all-done`,
                timestamp: timeStr,
                level: 'SUCCESS',
                stage: 'Pipeline',
                message: 'All 8 GATK stages completed successfully. Ready for Single Canvas dashboard inspection.',
              },
            ],
            variants: createGeneratedVariantsForSample(job.sampleId),
            metrics: createMetricsForSample(job.sampleId),
          };

          onUpdateJob(finalJob);
          return;
        } else {
          // Move to next stage
          const nextStage = job.stages[currentIdx + 1];
          newLogs.push({
            id: `log-${Date.now()}-start-next`,
            timestamp: timeStr,
            level: 'CMD' as const,
            stage: nextStage.name,
            message: `[${nextStage.tool}] Initializing: ${nextStage.commandSnippet}`,
          });

          onUpdateJob({
            ...job,
            currentStageIndex: currentIdx + 1,
            stages: updatedStages,
            logs: newLogs,
          });
        }
      } else {
        // Update current stage progress
        const updatedStages = job.stages.map((st, i) =>
          i === currentIdx ? { ...st, progress: newProgress } : st
        );

        // Add intermediate log occasionally
        const stageInfo = STAGE_DESCRIPTIONS[stage.id];
        let newLogs = job.logs;
        if (Math.random() > 0.4 && stageInfo?.logs.length) {
          const logMsg = stageInfo.logs[Math.floor(Math.random() * stageInfo.logs.length)];
          newLogs = [
            ...job.logs,
            {
              id: `log-${Date.now()}-prog`,
              timestamp: timeStr,
              level: 'INFO',
              stage: stage.name,
              message: `Progress ${newProgress}%: ${logMsg}`,
            },
          ];
        }

        onUpdateJob({
          ...job,
          stages: updatedStages,
          logs: newLogs,
        });
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [job, isPaused, speedMultiplier, onUpdateJob]);

  // Pause / Resume Toggle
  const handleTogglePause = () => {
    const nextPaused = !isPaused;
    setIsPaused(nextPaused);
    onUpdateJob({
      ...job,
      status: nextPaused ? 'Paused' : 'Running',
    });
  };

  // Instant Complete Simulation (Demo Mode)
  const handleInstantComplete = () => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const completedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(now.getDate()).padStart(2, '0')} ${timeStr}`;

    const instantStages: StageExecution[] = job.stages.map((st) => ({
      ...st,
      status: 'completed',
      progress: 100,
      startedAt: st.startedAt || '08:00',
      completedAt: timeStr,
    }));

    const finalJob: AnalysisJob = {
      ...job,
      status: 'Completed',
      completedAt: completedDate,
      stages: instantStages,
      currentStageIndex: 7,
      logs: [
        ...job.logs,
        {
          id: `log-${Date.now()}-fast-forward`,
          timestamp: timeStr,
          level: 'SUCCESS',
          stage: 'Pipeline',
          message: 'Workflow accelerated to completion. All GATK metrics and annotated variants materialized.',
        },
      ],
      variants: createGeneratedVariantsForSample(job.sampleId),
      metrics: createMetricsForSample(job.sampleId),
    };

    onUpdateJob(finalJob);
  };

  const handleCopyLogs = () => {
    const text = job.logs
      .map((l) => `[${l.timestamp}] [${l.stage}] [${l.level}] ${l.message}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopiedLog(true);
    setTimeout(() => setCopiedLog(false), 2000);
  };

  const filteredLogs = job.logs.filter(
    (l) => selectedStageId === 'all' || l.stage.toLowerCase().includes(selectedStageId.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xl font-bold font-mono text-white">
              Analysis ID: {job.id}
            </span>
            <span className="text-sm font-mono text-teal-300 bg-slate-800 px-2.5 py-0.5 rounded border border-slate-700">
              Sample: {job.sampleId}
            </span>

            {/* Status Badge */}
            {job.status === 'Completed' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5" />
                COMPLETED
              </span>
            ) : job.status === 'Running' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-950 text-amber-300 border border-amber-800">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                RUNNING
              </span>
            ) : job.status === 'Paused' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                <Pause className="w-3.5 h-3.5" />
                PAUSED
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-950 text-rose-300 border border-rose-800">
                <XCircle className="w-3.5 h-3.5" />
                FAILED
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
            <span>Project: <strong className="text-slate-200">{job.projectName}</strong></span>
            <span>Reference: <strong className="text-slate-200 font-mono">{job.referenceGenome}</strong></span>
            <span>Created: <strong className="text-slate-200 font-mono">{job.createdAt}</strong></span>
          </div>
        </div>

        {/* Workflow Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {job.status === 'Completed' ? (
            <button
              onClick={() => onViewResults(job.id)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-xs flex items-center gap-2 shadow-md cursor-pointer transition-colors"
            >
              <BarChart2 className="w-4 h-4" />
              <span>View Results & Single Canvas (UC-07)</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <>
              {/* Speed multiplier buttons */}
              <div className="flex items-center bg-slate-950 rounded-lg p-1 border border-slate-800 text-xs">
                <span className="text-[10px] text-slate-500 font-mono px-2">Speed:</span>
                <button
                  onClick={() => setSpeedMultiplier(1)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono cursor-pointer ${
                    speedMultiplier === 1
                      ? 'bg-teal-600 text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  1x
                </button>
                <button
                  onClick={() => setSpeedMultiplier(3)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono cursor-pointer ${
                    speedMultiplier === 3
                      ? 'bg-teal-600 text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  3x Fast
                </button>
              </div>

              {/* Pause / Resume */}
              <button
                onClick={handleTogglePause}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
              >
                {isPaused ? <Play className="w-3.5 h-3.5 text-teal-400" /> : <Pause className="w-3.5 h-3.5" />}
                <span>{isPaused ? 'Resume' : 'Pause'}</span>
              </button>

              {/* Fast Forward button */}
              <button
                onClick={handleInstantComplete}
                className="px-3 py-2 bg-teal-950/80 hover:bg-teal-900 border border-teal-700/80 text-teal-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Immediately complete simulation to inspect results"
              >
                <FastForward className="w-3.5 h-3.5" />
                <span>Fast-Forward</span>
              </button>

              {/* Cancel Job */}
              <button
                onClick={() => onCancelJob(job.id)}
                className="px-3 py-2 bg-rose-950/40 hover:bg-rose-950 border border-rose-800/60 text-rose-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Grid: Left = Vertical Pipeline Progress (Section 10) / Right = Process Log Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Vertical Pipeline Stages (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-semibold text-white">Pipeline Execution Flow</h2>
              <p className="text-[11px] text-slate-400">8 Automated Bioinformatics Stages</p>
            </div>
            <span className="text-[10px] font-mono text-teal-400 bg-teal-950 border border-teal-800 px-2 py-0.5 rounded">
              GATK Best Practices
            </span>
          </div>

          {/* Vertical Pipeline Stage List */}
          <div className="space-y-2.5">
            {job.stages.map((st, idx) => {
              const isCurrent = st.status === 'running';
              const isCompleted = st.status === 'completed';
              const isPending = st.status === 'pending';

              return (
                <div
                  key={st.id}
                  className={`p-3 rounded-lg border transition-all ${
                    isCurrent
                      ? 'bg-teal-950/30 border-teal-500/80 shadow-md ring-1 ring-teal-500/40'
                      : isCompleted
                      ? 'bg-slate-950/60 border-slate-800 text-slate-200'
                      : 'bg-slate-950/30 border-slate-800/60 text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {/* Status Icon */}
                      {isCompleted ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      ) : isCurrent ? (
                        <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs">
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center text-xs">
                          <span className="text-[10px] font-mono">{idx + 1}</span>
                        </div>
                      )}

                      <div>
                        <div className="text-xs font-medium text-white flex items-center gap-2">
                          <span>{st.name}</span>
                          {isCurrent && (
                            <span className="text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-800/80 px-1.5 py-0.2 rounded animate-pulse">
                              Running...
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {st.tool}
                        </div>
                      </div>
                    </div>

                    <div className="text-right font-mono text-[11px]">
                      {isCompleted ? (
                        <span className="text-emerald-400 font-semibold">100%</span>
                      ) : isCurrent ? (
                        <span className="text-amber-300 font-semibold">{st.progress}%</span>
                      ) : (
                        <span className="text-slate-500">Pending</span>
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-2.5 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${
                        isCompleted
                          ? 'bg-emerald-500'
                          : isCurrent
                          ? 'bg-teal-400'
                          : 'bg-transparent'
                      }`}
                      style={{ width: `${st.progress}%` }}
                    />
                  </div>

                  {/* Stage description */}
                  <p className="mt-2 text-[10px] text-slate-400 leading-snug">
                    {st.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Process Log Panel (7 cols) */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-xs flex flex-col h-[650px]">
          {/* Terminal Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs shrink-0">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-teal-400" />
              <span className="font-semibold text-white">Process Log (Live Streaming)</span>
              <span className="text-[10px] font-mono bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded">
                {job.logs.length} entries
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyLogs}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded text-[11px] font-mono flex items-center gap-1 transition-colors cursor-pointer"
                title="Copy entire log stream"
              >
                {copiedLog ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedLog ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Terminal Body */}
          <div className="flex-1 overflow-y-auto font-mono text-[11px] p-3 space-y-1.5 text-slate-300 select-text">
            {filteredLogs.map((log) => {
              const levelColor =
                log.level === 'SUCCESS'
                  ? 'text-emerald-400'
                  : log.level === 'ERROR'
                  ? 'text-rose-400'
                  : log.level === 'CMD'
                  ? 'text-cyan-300 font-semibold'
                  : log.level === 'WARN'
                  ? 'text-amber-400'
                  : 'text-slate-400';

              return (
                <div key={log.id} className="leading-relaxed hover:bg-slate-900/60 px-1.5 py-0.5 rounded transition-colors flex items-start gap-2">
                  <span className="text-slate-500 shrink-0 select-none">
                    [{log.timestamp}]
                  </span>
                  <span className={`text-[10px] px-1 rounded uppercase font-bold shrink-0 ${levelColor}`}>
                    [{log.level}]
                  </span>
                  <span className="text-teal-400/90 shrink-0 font-medium">
                    [{log.stage}]
                  </span>
                  <span className="text-slate-200 break-words flex-1">
                    {log.message}
                  </span>
                </div>
              );
            })}
            <div ref={logTerminalEndRef} />
          </div>

          {/* Terminal Footer Status Bar */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              <span>Bioinformatics worker daemon connected</span>
            </div>
            <span>Stream format: RFC-5424</span>
          </div>
        </div>
      </div>
    </div>
  );
};
