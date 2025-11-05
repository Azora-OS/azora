#!/usr/bin/env python3
"""
Cloud GPU Manager for AZR Mining Engine
Automatically provisions and manages cloud GPUs for optimal mining
"""

import asyncio
import logging
import boto3
import google.cloud.compute_v1 as compute_v1
from vastai import VastAI
import requests
from datetime import datetime, timezone
import json
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CloudGPUManager:
    def __init__(self):
        self.providers = {
            'aws': self._init_aws(),
            'gcp': self._init_gcp(),
            'vastai': self._init_vastai()
        }
        self.active_instances = {}
        self.profitability_threshold = 0.5  # Minimum $0.50/day profit

    def _init_aws(self):
        """Initialize AWS EC2 client"""
        try:
            return boto3.client('ec2', region_name='us-east-1')
        except:
            logger.warning("AWS credentials not available")
            return None

    def _init_gcp(self):
        """Initialize Google Cloud Compute client"""
        try:
            return compute_v1.InstancesClient()
        except:
            logger.warning("GCP credentials not available")
            return None

    def _init_vastai(self):
        """Initialize Vast.ai client"""
        try:
            return VastAI(api_key=os.getenv('VASTAI_API_KEY'))
        except:
            logger.warning("Vast.ai API key not available")
            return None

    async def check_profitability(self, provider, instance_type):
        """Check if a cloud instance would be profitable"""
        # Get current mining profitability for the instance type
        profitability_data = await self.get_mining_profitability(provider, instance_type)

        if not profitability_data:
            return False

        daily_profit = profitability_data.get('daily_profit', 0)
        hourly_cost = profitability_data.get('hourly_cost', 0)
        daily_cost = hourly_cost * 24

        net_daily_profit = daily_profit - daily_cost

        return net_daily_profit > self.profitability_threshold

    async def get_mining_profitability(self, provider, instance_type):
        """Get mining profitability data for instance type"""
        # This would query mining profitability APIs
        # For now, return mock data based on our calculations

        profitability_map = {
            'aws_p4d': {
                'daily_profit': 86.40,  # LTC mining profit
                'hourly_cost': 32.77,
                'gpu_count': 8,
                'gpu_type': 'A100'
            },
            'gcp_a100': {
                'daily_profit': 21.60,
                'hourly_cost': 2.50,
                'gpu_count': 1,
                'gpu_type': 'A100'
            },
            'vastai_3090': {
                'daily_profit': 11.70,  # Scaled down for single GPU
                'hourly_cost': 1.50,
                'gpu_count': 1,
                'gpu_type': 'RTX 3090'
            }
        }

        return profitability_map.get(f"{provider}_{instance_type}")

    async def provision_instance(self, provider, instance_type, region='us-east-1'):
        """Provision a cloud GPU instance"""
        logger.info(f"Provisioning {provider} {instance_type} in {region}")

        if provider == 'aws':
            return await self._provision_aws(instance_type, region)
        elif provider == 'gcp':
            return await self._provision_gcp(instance_type, region)
        elif provider == 'vastai':
            return await self._provision_vastai(instance_type)

        return None

    async def _provision_aws(self, instance_type, region):
        """Provision AWS EC2 instance"""
        if not self.providers['aws']:
            return None

        try:
            response = self.providers['aws'].run_instances(
                ImageId='ami-12345678',  # Custom mining AMI
                MinCount=1,
                MaxCount=1,
                InstanceType=instance_type,
                KeyName='mining-key',
                SecurityGroups=['mining-sg']
            )

            instance_id = response['Instances'][0]['InstanceId']
            self.active_instances[instance_id] = {
                'provider': 'aws',
                'type': instance_type,
                'region': region,
                'start_time': datetime.now(timezone.utc)
            }

            logger.info(f"AWS instance {instance_id} provisioned")
            return instance_id

        except Exception as e:
            logger.error(f"AWS provisioning failed: {e}")
            return None

    async def _provision_gcp(self, instance_type, region):
        """Provision Google Cloud instance"""
        if not self.providers['gcp']:
            return None

        try:
            # GCP provisioning logic would go here
            logger.info("GCP provisioning not implemented yet")
            return None
        except Exception as e:
            logger.error(f"GCP provisioning failed: {e}")
            return None

    async def _provision_vastai(self, instance_type):
        """Provision Vast.ai instance"""
        if not self.providers['vastai']:
            return None

        try:
            # Search for available instances
            offers = self.providers['vastai'].search_offers(
                gpu_name='RTX 3090',
                reliability=0.9,
                verified=True
            )

            if offers:
                # Rent the best offer
                instance = self.providers['vastai'].create_instance(
                    offer_id=offers[0]['id'],
                    image='pytorch/pytorch'
                )

                instance_id = instance['id']
                self.active_instances[instance_id] = {
                    'provider': 'vastai',
                    'type': instance_type,
                    'start_time': datetime.now(timezone.utc)
                }

                logger.info(f"Vast.ai instance {instance_id} provisioned")
                return instance_id

        except Exception as e:
            logger.error(f"Vast.ai provisioning failed: {e}")
            return None

    async def terminate_instance(self, instance_id):
        """Terminate a cloud instance"""
        if instance_id not in self.active_instances:
            return False

        instance_info = self.active_instances[instance_id]
        provider = instance_info['provider']

        try:
            if provider == 'aws':
                self.providers['aws'].terminate_instances(InstanceIds=[instance_id])
            elif provider == 'gcp':
                # GCP termination logic
                pass
            elif provider == 'vastai':
                self.providers['vastai'].destroy_instance(instance_id)

            del self.active_instances[instance_id]
            logger.info(f"Instance {instance_id} terminated")
            return True

        except Exception as e:
            logger.error(f"Instance termination failed: {e}")
            return False

    async def auto_scale(self):
        """Automatically scale cloud GPU instances based on profitability"""
        while True:
            try:
                logger.info("Running auto-scaling check...")

                # Check current profitability for each provider
                for provider in ['aws', 'gcp', 'vastai']:
                    for instance_type in self._get_instance_types(provider):
                        profitable = await self.check_profitability(provider, instance_type)

                        if profitable:
                            # Check if we already have this type running
                            existing = [i for i in self.active_instances.values()
                                      if i['provider'] == provider and i['type'] == instance_type]

                            if len(existing) < 3:  # Max 3 instances per type
                                logger.info(f"Provisioning profitable {provider} {instance_type}")
                                await self.provision_instance(provider, instance_type)
                        else:
                            # Terminate unprofitable instances
                            to_terminate = [i for i in self.active_instances.items()
                                          if i[1]['provider'] == provider and i[1]['type'] == instance_type]

                            for instance_id, _ in to_terminate:
                                logger.info(f"Terminating unprofitable {instance_id}")
                                await self.terminate_instance(instance_id)

                await asyncio.sleep(3600)  # Check every hour

            except Exception as e:
                logger.error(f"Auto-scaling error: {e}")
                await asyncio.sleep(300)

    def _get_instance_types(self, provider):
        """Get available instance types for provider"""
        types = {
            'aws': ['p4d.24xlarge'],
            'gcp': ['a100'],
            'vastai': ['3090']
        }
        return types.get(provider, [])

    async def get_cost_report(self):
        """Generate cost and profitability report"""
        total_cost = 0
        total_profit = 0

        for instance_id, info in self.active_instances.items():
            runtime_hours = (datetime.now(timezone.utc) - info['start_time']).total_seconds() / 3600
            hourly_cost = await self._get_hourly_cost(info['provider'], info['type'])
            daily_profit = await self._get_daily_profit(info['provider'], info['type'])

            instance_cost = runtime_hours * hourly_cost
            instance_profit = (runtime_hours / 24) * daily_profit

            total_cost += instance_cost
            total_profit += instance_profit

        return {
            'total_cost': total_cost,
            'total_profit': total_profit,
            'net_profit': total_profit - total_cost,
            'active_instances': len(self.active_instances)
        }

    async def _get_hourly_cost(self, provider, instance_type):
        """Get hourly cost for instance type"""
        costs = {
            'aws_p4d': 32.77,
            'gcp_a100': 2.50,
            'vastai_3090': 1.50
        }
        return costs.get(f"{provider}_{instance_type}", 0)

    async def _get_daily_profit(self, provider, instance_type):
        """Get daily profit for instance type"""
        profits = {
            'aws_p4d': 86.40,
            'gcp_a100': 21.60,
            'vastai_3090': 11.70
        }
        return profits.get(f"{provider}_{instance_type}", 0)

async def main():
    manager = CloudGPUManager()

    # Start auto-scaling
    scaling_task = asyncio.create_task(manager.auto_scale())

    # Run cost reporting every 6 hours
    while True:
        await asyncio.sleep(21600)  # 6 hours
        report = await manager.get_cost_report()
        logger.info(f"Cost Report: {json.dumps(report, indent=2)}")

if __name__ == "__main__":
    asyncio.run(main())