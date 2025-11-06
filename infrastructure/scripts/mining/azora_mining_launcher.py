#!/usr/bin/env python3
"""
AZORA OS - Production Mining Launcher
Launches ethminer with WoolyPooly pool configuration for live AZR mining
Date: October 27, 2025
"""

import os
import sys
import subprocess
import logging
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env.production')

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('mining_launcher.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

class AzoraMiningLauncher:
    def __init__(self):
        self.pool_url = os.getenv('WOOLYPOOLY_POOL_URL')
        self.username = os.getenv('WOOLYPOOLY_USERNAME')
        self.worker = os.getenv('WOOLYPOOLY_WORKER', 'AZORA-Miner')
        self.password = os.getenv('WOOLYPOOLY_PASSWORD', 'x')

        # Mining parameters
        self.algorithm = os.getenv('MINING_ALGORITHM', 'Ethash')
        self.coin = os.getenv('MINING_COIN', 'Ethereum')
        self.gpu_type = os.getenv('GPU_TYPE', 'NVIDIA')
        self.cuda_enabled = os.getenv('CUDA_ENABLED', 'true').lower() == 'true'
        self.opencl_enabled = os.getenv('OPENCL_ENABLED', 'false').lower() == 'true'

        # Performance settings
        self.farm_recheck_ms = int(os.getenv('FARM_RECHECK_MS', '2000'))
        self.gpu_clock_offset = int(os.getenv('GPU_CLOCK_OFFSET', '0'))
        self.gpu_memory_offset = int(os.getenv('GPU_MEMORY_OFFSET', '0'))
        self.gpu_fan_speed = int(os.getenv('GPU_FAN_SPEED', '70'))

        # AZORA integration
        self.azora_mining_enabled = os.getenv('AZORA_MINING_ENABLED', 'true').lower() == 'true'
        self.azora_auto_mint = os.getenv('AZORA_AUTO_MINT', 'true').lower() == 'true'
        self.azora_profit_threshold = float(os.getenv('AZORA_PROFIT_THRESHOLD', '0.01'))

    def validate_configuration(self):
        """Validate mining configuration before starting"""
        required_vars = ['WOOLYPOOLY_POOL_URL', 'WOOLYPOOLY_USERNAME']
        missing_vars = [var for var in required_vars if not os.getenv(var)]

        if missing_vars:
            logger.error(f"Missing required environment variables: {missing_vars}")
            return False

        # Check if ethminer is available
        try:
            result = subprocess.run(['which', 'ethminer'],
                                  capture_output=True, text=True)
            if result.returncode != 0:
                logger.error("ethminer not found in PATH. Please install ethminer.")
                return False
        except Exception as e:
            logger.error(f"Error checking ethminer: {e}")
            return False

        logger.info("Configuration validation passed")
        return True

    def build_ethminer_command(self):
        """Build the ethminer command with WoolyPooly configuration"""
        cmd = ['ethminer']

        # Pool connection
        cmd.extend(['-P', f'{self.pool_url}/{self.username}.{self.worker}/{self.password}'])

        # GPU settings
        if self.cuda_enabled:
            cmd.append('--cuda')
            cmd.extend(['--cuda-devices', '0'])  # Use all CUDA devices
        elif self.opencl_enabled:
            cmd.append('--opencl')
            cmd.extend(['--opencl-devices', '0'])  # Use all OpenCL devices

        # Performance tuning
        cmd.extend(['--farm-recheck', str(self.farm_recheck_ms)])

        # GPU tuning (if supported)
        if self.gpu_clock_offset != 0:
            cmd.extend(['--cuda-grid-size', str(self.gpu_clock_offset)])
        if self.gpu_memory_offset != 0:
            cmd.extend(['--cuda-block-size', str(self.gpu_memory_offset)])

        # Logging and monitoring
        cmd.extend(['--log-file', 'ethminer.log'])
        cmd.extend(['--verbosity', '3'])  # Verbose logging

        return cmd

    def start_mining(self):
        """Start the mining process"""
        if not self.validate_configuration():
            logger.error("Configuration validation failed. Cannot start mining.")
            return False

        cmd = self.build_ethminer_command()
        logger.info(f"Starting mining with command: {' '.join(cmd)}")
        logger.info(f"Pool: {self.pool_url}")
        logger.info(f"Username: {self.username}")
        logger.info(f"Worker: {self.worker}")

        try:
            # Start ethminer process
            process = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1,
                universal_newlines=True
            )

            logger.info(f"Mining process started with PID: {process.pid}")

            # Monitor the process
            while True:
                output = process.stdout.readline()
                if output == '' and process.poll() is not None:
                    break
                if output:
                    logger.info(f"ethminer: {output.strip()}")

            return_code = process.poll()
            if return_code == 0:
                logger.info("Mining process completed successfully")
                return True
            else:
                logger.error(f"Mining process failed with return code: {return_code}")
                return False

        except Exception as e:
            logger.error(f"Error starting mining process: {e}")
            return False

    def get_mining_stats(self):
        """Get current mining statistics"""
        # This would integrate with mining pool APIs to get stats
        # For now, return basic info
        return {
            'pool': self.pool_url,
            'username': self.username,
            'worker': self.worker,
            'algorithm': self.algorithm,
            'coin': self.coin,
            'status': 'configured'
        }

def main():
    """Main entry point for AZORA mining launcher"""
    logger.info("AZORA OS - Production Mining Launcher Starting")

    launcher = AzoraMiningLauncher()

    # Display configuration
    stats = launcher.get_mining_stats()
    logger.info("Mining Configuration:")
    for key, value in stats.items():
        logger.info(f"  {key}: {value}")

    # Start mining
    success = launcher.start_mining()

    if success:
        logger.info("AZORA mining session completed successfully")
        sys.exit(0)
    else:
        logger.error("AZORA mining session failed")
        sys.exit(1)

if __name__ == "__main__":
    main()