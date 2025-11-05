//! # PROCESS MANAGEMENT MODULE
//!
//! Constitutional process creation and management

use crate::memory::{ProcessId, SovereigntyLevel};
use crate::pivc::ImpactScore;

#[derive(Debug)]
pub struct Process {
    pub id: ProcessId,
    pub name: String,
    pub sovereignty_level: SovereigntyLevel,
    pub pivc_score: ImpactScore,
    pub state: ProcessState,
    pub stack_base: Option<*mut u8>,
    pub heap_base: Option<*mut u8>,
    pub stack_size: usize,
    pub heap_size: usize,
}

#[derive(Debug, Clone, Copy)]
pub enum ProcessState {
    Ready,
    Running,
    Waiting,
    Terminated,
}

impl Process {
    pub fn new(id: ProcessId, name: &str, sovereignty_level: SovereigntyLevel) -> Self {
        Self {
            id,
            name: name.into(),
            sovereignty_level,
            pivc_score: ImpactScore::zero(),
            state: ProcessState::Ready,
            stack_base: None,
            heap_base: None,
            stack_size: 0,
            heap_size: 0,
        }
    }

    pub fn set_stack(&mut self, base: *mut u8, size: usize) {
        self.stack_base = Some(base);
        self.stack_size = size;
    }

    pub fn set_heap(&mut self, base: *mut u8, size: usize) {
        self.heap_base = Some(base);
        self.heap_size = size;
    }

    pub fn set_pivc_score(&mut self, score: ImpactScore) {
        self.pivc_score = score;
    }
}
