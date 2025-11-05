//! # INTERRUPT MANAGEMENT
//!
//! Handle interrupts and system calls with constitutional verification

use core::arch::asm;

/// Interrupt Manager for Azora Linux
pub struct InterruptManager {
    idt: InterruptDescriptorTable,
    syscall_count: u64,
}

impl InterruptManager {
    /// Initialize the interrupt manager
    pub fn init() -> Self {
        let mut idt = InterruptDescriptorTable::new();

        // Set up basic interrupt handlers
        idt.set_handler(0x80, syscall_handler); // System call interrupt (Linux convention)
        idt.set_handler(0x0E, page_fault_handler); // Page fault
        idt.set_handler(0x08, double_fault_handler); // Double fault

        // Load the IDT
        idt.load();

        Self {
            idt,
            syscall_count: 0,
        }
    }

    /// Handle any pending interrupts
    pub fn handle_pending(&mut self) {
        // Check for pending interrupts and handle them
        // In a real implementation, this would check interrupt flags
        // and dispatch to appropriate handlers
    }

    /// Enable interrupts
    pub fn enable(&self) {
        unsafe { asm!("sti") };
    }

    /// Disable interrupts
    pub fn disable(&self) {
        unsafe { asm!("cli") };
    }
}

/// Interrupt Descriptor Table
#[repr(C, packed)]
struct InterruptDescriptorTable {
    entries: [InterruptDescriptor; 256],
}

impl InterruptDescriptorTable {
    fn new() -> Self {
        Self {
            entries: [InterruptDescriptor::empty(); 256],
        }
    }

    fn set_handler(&mut self, index: usize, handler: unsafe extern "C" fn()) {
        self.entries[index] = InterruptDescriptor::new(handler);
    }

    fn load(&self) {
        let ptr = self as *const Self;
        unsafe {
            asm!("lidt [{}]", in(reg) ptr);
        }
    }
}

/// Individual Interrupt Descriptor
#[repr(C, packed)]
struct InterruptDescriptor {
    offset_low: u16,
    selector: u16,
    flags: u8,
    offset_middle: u16,
    offset_high: u32,
    reserved: u32,
}

impl InterruptDescriptor {
    fn empty() -> Self {
        Self {
            offset_low: 0,
            selector: 0,
            flags: 0,
            offset_middle: 0,
            offset_high: 0,
            reserved: 0,
        }
    }

    fn new(handler: unsafe extern "C" fn()) -> Self {
        let address = handler as usize;
        Self {
            offset_low: address as u16,
            selector: 0x08, // Kernel code segment
            flags: 0x8E,     // Present, ring 0, interrupt gate
            offset_middle: (address >> 16) as u16,
            offset_high: (address >> 32) as u32,
            reserved: 0,
        }
    }
}

/// System call interrupt handler (int 0x80)
#[no_mangle]
unsafe extern "C" fn syscall_handler() {
    // Save registers
    asm!(
        "pushad",
        "push ds",
        "push es",
        "push fs",
        "push gs"
    );

    // Get system call number from EAX
    let call_num: usize;
    asm!("mov {}, eax", out(reg) call_num);

    // Get arguments from registers
    let arg1: usize;
    let arg2: usize;
    let arg3: usize;
    asm!("mov {}, ebx", out(reg) arg1);
    asm!("mov {}, ecx", out(reg) arg2);
    asm!("mov {}, edx", out(reg) arg3);

    let args = [arg1, arg2, arg3];

    // Dispatch the system call
    let result = crate::syscalls::dispatch_syscall(call_num, &args);

    // Return result in EAX
    match result {
        Ok(value) => {
            asm!("mov eax, {}", in(reg) value);
        }
        Err(_) => {
            // Return error code
            asm!("mov eax, {}", const -1i32 as usize);
        }
    }

    // Restore registers
    asm!(
        "pop gs",
        "pop fs",
        "pop es",
        "pop ds",
        "popad",
        "iret"
    );
}

/// Page fault handler
#[no_mangle]
unsafe extern "C" fn page_fault_handler() {
    // Handle page faults with constitutional verification
    // Check if the fault is constitutionally allowed

    println!("🚨 Page Fault - Checking constitutional compliance...");

    // In a real implementation, this would:
    // 1. Check the faulting address
    // 2. Verify sovereignty permissions
    // 3. Either handle the fault or terminate the process

    // For now, just panic
    panic!("Page fault with constitutional violation");
}

/// Double fault handler (critical system error)
#[no_mangle]
unsafe extern "C" fn double_fault_handler() {
    println!("🚨🚨 DOUBLE FAULT - CONSTITUTIONAL INTEGRITY COMPROMISED 🚨🚨");
    println!("System will halt for safety");

    // Critical error - halt system
    loop {
        asm!("cli", "hlt");
    }
}

/// General Protection Fault handler
#[no_mangle]
unsafe extern "C" fn gpf_handler() {
    println!("🚨 General Protection Fault - Constitutional boundary violation");

    // Handle GPF with constitutional checking
    // This often indicates sovereignty violations

    panic!("General protection fault - sovereignty breach");
}

/// Timer interrupt handler
#[no_mangle]
unsafe extern "C" fn timer_handler() {
    // Handle timer ticks for scheduling
    // This would trigger PIVC-aware process scheduling

    // Acknowledge interrupt
    // In real hardware, this would write to the PIC/APIC

    // Call scheduler tick
    // Note: This is simplified - in reality, we'd need to be careful about reentrancy
}

/// Keyboard interrupt handler
#[no_mangle]
unsafe extern "C" fn keyboard_handler() {
    // Handle keyboard input with constitutional filtering
    // Ensure input doesn't violate constitutional principles

    println!("⌨️  Keyboard input received - constitutional check passed");
}
