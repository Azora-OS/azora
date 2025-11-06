//! # PIVC-AWARE SCHEDULER
//!
//! Process scheduling optimized for constitutional principles and PIVC

use crate::process::{Process, ProcessId, ProcessState};
use crate::pivc::{PivcManager, PivcOptimizationMode};
use crate::constitutional::ConstitutionalOracle;

pub struct Scheduler {
    oracle: &'static ConstitutionalOracle,
    pivc_manager: &'static PivcManager,
    processes: alloc::collections::BTreeMap<ProcessId, Process>,
    current_process: Option<ProcessId>,
    mode: SchedulingMode,
}

#[derive(Debug, Clone, Copy)]
pub enum SchedulingMode {
    PivcOptimized,
    FairShare,
    RealTime,
    SovereignFirst,
}

impl Scheduler {
    pub fn init(oracle: &'static ConstitutionalOracle, pivc: &'static PivcManager, mode: SchedulingMode) -> Self {
        Self {
            oracle,
            pivc_manager: pivc,
            processes: alloc::collections::BTreeMap::new(),
            current_process: None,
            mode,
        }
    }

    pub fn add_process(&mut self, process: Process) {
        self.processes.insert(process.id, process);
    }

    pub fn schedule_tick(&mut self) {
        // Implement scheduling logic based on PIVC scores
    }

    pub fn create_process(&mut self, _parent_id: ProcessId, name: &str, sovereignty_level: crate::memory::SovereigntyLevel) -> Process {
        let id = ProcessId(self.processes.len() as u32 + 1);
        Process::new(id, name, sovereignty_level)
    }

    pub fn get_pivc_score(&self, pid: ProcessId) -> Option<crate::pivc::ImpactScore> {
        self.pivc_manager.get_score(pid)
    }
}
