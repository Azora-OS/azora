/**
 * Enterprise Support Service
 * Manages support tickets, SLA tracking, and priority routing
 */

import { PrismaClient, SupportPriority, SupportTicketStatus } from '@prisma/client';
import { logger } from '../shared/logging';
import { ErrorHandler } from '../payment/error-handler';

const prisma = new PrismaClient();

// SLA response times in hours
const SLA_RESPONSE_TIMES: Record<SupportPriority, number> = {
  LOW: 48,
  NORMAL: 24,
  HIGH: 4,
  CRITICAL: 1,
};

export interface CreateTicketInput {
  licenseId: string;
  title: string;
  description: string;
  priority: SupportPriority;
  createdBy: string;
}

export interface TicketResponse {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  priority: SupportPriority;
  status: SupportTicketStatus;
  assignedTo: string | null;
  createdBy: string;
  createdAt: Date;
  resolvedAt: Date | null;
  slaResponseTime: number; // in hours
  slaStatus: 'ON_TRACK' | 'AT_RISK' | 'BREACHED';
}

export class EnterpriseSupportService {
  /**
   * Create support ticket
   */
  async createTicket(input: CreateTicketInput): Promise<TicketResponse> {
    try {
      logger.info('Creating support ticket', {
        licenseId: input.licenseId,
        priority: input.priority,
      });

      const license = await prisma.enterpriseLicense.findUnique({
        where: { id: input.licenseId },
      });

      if (!license) {
        throw new Error(`License ${input.licenseId} not found`);
      }

      // Generate ticket number
      const ticketNumber = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`.toUpperCase();

      const ticket = await prisma.enterpriseSupportTicket.create({
        data: {
          licenseId: input.licenseId,
          ticketNumber,
          title: input.title,
          description: input.description,
          priority: input.priority,
          status: 'OPEN',
          createdBy: input.createdBy,
        },
      });

      logger.info('Support ticket created', { ticketNumber });

      return this.mapTicketResponse(ticket);
    } catch (error) {
      logger.error('Failed to create support ticket', { error, ...input });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Assign ticket
   */
  async assignTicket(ticketId: string, assignedTo: string): Promise<TicketResponse> {
    try {
      logger.info('Assigning ticket', { ticketId, assignedTo });

      const ticket = await prisma.enterpriseSupportTicket.findUnique({
        where: { id: ticketId },
      });

      if (!ticket) {
        throw new Error(`Ticket ${ticketId} not found`);
      }

      const updated = await prisma.enterpriseSupportTicket.update({
        where: { id: ticketId },
        data: {
          assignedTo,
          status: 'IN_PROGRESS',
        },
      });

      logger.info('Ticket assigned', { ticketId, assignedTo });

      return this.mapTicketResponse(updated);
    } catch (error) {
      logger.error('Failed to assign ticket', { error, ticketId });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Update ticket status
   */
  async updateTicketStatus(ticketId: string, status: SupportTicketStatus): Promise<TicketResponse> {
    try {
      logger.info('Updating ticket status', { ticketId, status });

      const ticket = await prisma.enterpriseSupportTicket.findUnique({
        where: { id: ticketId },
      });

      if (!ticket) {
        throw new Error(`Ticket ${ticketId} not found`);
      }

      const resolvedAt = status === 'RESOLVED' || status === 'CLOSED' ? new Date() : null;

      const updated = await prisma.enterpriseSupportTicket.update({
        where: { id: ticketId },
        data: {
          status,
          resolvedAt,
        },
      });

      logger.info('Ticket status updated', { ticketId, status });

      return this.mapTicketResponse(updated);
    } catch (error) {
      logger.error('Failed to update ticket status', { error, ticketId });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Get ticket by ID
   */
  async getTicket(ticketId: string): Promise<TicketResponse | null> {
    try {
      const ticket = await prisma.enterpriseSupportTicket.findUnique({
        where: { id: ticketId },
      });

      if (!ticket) {
        return null;
      }

      return this.mapTicketResponse(ticket);
    } catch (error) {
      logger.error('Failed to get ticket', { error, ticketId });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Get tickets for license
   */
  async getLicenseTickets(
    licenseId: string,
    status?: SupportTicketStatus,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    tickets: TicketResponse[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const skip = (page - 1) * limit;

      const where: any = { licenseId };
      if (status) {
        where.status = status;
      }

      const [tickets, total] = await Promise.all([
        prisma.enterpriseSupportTicket.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.enterpriseSupportTicket.count({ where }),
      ]);

      return {
        tickets: tickets.map((t) => this.mapTicketResponse(t)),
        total,
        page,
        limit,
      };
    } catch (error) {
      logger.error('Failed to get license tickets', { error, licenseId });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Get open tickets
   */
  async getOpenTickets(): Promise<TicketResponse[]> {
    try {
      const tickets = await prisma.enterpriseSupportTicket.findMany({
        where: {
          status: {
            in: ['OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER'],
          },
        },
        orderBy: [{ priority: 'asc' }, { createdAt: 'asc' }],
      });

      return tickets.map((t) => this.mapTicketResponse(t));
    } catch (error) {
      logger.error('Failed to get open tickets', { error });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Get SLA breached tickets
   */
  async getSLABreachedTickets(): Promise<TicketResponse[]> {
    try {
      const tickets = await prisma.enterpriseSupportTicket.findMany({
        where: {
          status: {
            in: ['OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER'],
          },
        },
      });

      const now = new Date();
      const breachedTickets: TicketResponse[] = [];

      for (const ticket of tickets) {
        const slaHours = SLA_RESPONSE_TIMES[ticket.priority];
        const slaDeadline = new Date(ticket.createdAt.getTime() + slaHours * 60 * 60 * 1000);

        if (now > slaDeadline) {
          breachedTickets.push(this.mapTicketResponse(ticket));
        }
      }

      return breachedTickets;
    } catch (error) {
      logger.error('Failed to get SLA breached tickets', { error });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Get support statistics
   */
  async getSupportStats(): Promise<{
    totalTickets: number;
    openTickets: number;
    resolvedTickets: number;
    averageResolutionTime: number; // in hours
    slaComplianceRate: number; // percentage
  }> {
    try {
      const [total, open, resolved] = await Promise.all([
        prisma.enterpriseSupportTicket.count(),
        prisma.enterpriseSupportTicket.count({
          where: { status: { in: ['OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER'] } },
        }),
        prisma.enterpriseSupportTicket.count({
          where: { status: { in: ['RESOLVED', 'CLOSED'] } },
        }),
      ]);

      const resolvedTickets = await prisma.enterpriseSupportTicket.findMany({
        where: { status: { in: ['RESOLVED', 'CLOSED'] } },
      });

      let totalResolutionTime = 0;
      let slaCompliant = 0;

      for (const ticket of resolvedTickets) {
        if (ticket.resolvedAt) {
          const resolutionTime = (ticket.resolvedAt.getTime() - ticket.createdAt.getTime()) / (1000 * 60 * 60);
          totalResolutionTime += resolutionTime;

          const slaHours = SLA_RESPONSE_TIMES[ticket.priority];
          if (resolutionTime <= slaHours) {
            slaCompliant++;
          }
        }
      }

      const averageResolutionTime = resolvedTickets.length > 0 ? totalResolutionTime / resolvedTickets.length : 0;
      const slaComplianceRate = resolvedTickets.length > 0 ? (slaCompliant / resolvedTickets.length) * 100 : 0;

      return {
        totalTickets: total,
        openTickets: open,
        resolvedTickets: resolved,
        averageResolutionTime: Math.round(averageResolutionTime),
        slaComplianceRate: Math.round(slaComplianceRate),
      };
    } catch (error) {
      logger.error('Failed to get support stats', { error });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Map ticket to response format
   */
  private mapTicketResponse(ticket: any): TicketResponse {
    const slaHours = SLA_RESPONSE_TIMES[ticket.priority];
    const slaDeadline = new Date(ticket.createdAt.getTime() + slaHours * 60 * 60 * 1000);
    const now = new Date();
    const hoursElapsed = (now.getTime() - ticket.createdAt.getTime()) / (1000 * 60 * 60);

    let slaStatus: 'ON_TRACK' | 'AT_RISK' | 'BREACHED' = 'ON_TRACK';
    if (now > slaDeadline) {
      slaStatus = 'BREACHED';
    } else if (hoursElapsed > slaHours * 0.8) {
      slaStatus = 'AT_RISK';
    }

    return {
      id: ticket.id,
      ticketNumber: ticket.ticketNumber,
      title: ticket.title,
      description: ticket.description,
      priority: ticket.priority,
      status: ticket.status,
      assignedTo: ticket.assignedTo,
      createdBy: ticket.createdBy,
      createdAt: ticket.createdAt,
      resolvedAt: ticket.resolvedAt,
      slaResponseTime: slaHours,
      slaStatus,
    };
  }
}

export default new EnterpriseSupportService();
