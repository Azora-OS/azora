//! # SOVEREIGNTY MANAGER
//!
//! Protects user sovereignty and constitutional rights

pub struct SovereigntyManager;

impl SovereigntyManager {
    pub fn init(_oracle: &crate::constitutional::ConstitutionalOracle) -> Self {
        Self
    }
}

#[derive(Debug)]
pub struct AccessControl;
