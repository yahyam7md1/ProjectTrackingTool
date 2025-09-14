/**
 * Type definitions for client-related entities
 */

/**
 * Represents a project from the client perspective
 */
export interface ClientProject {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'pending' | 'canceled';
  clientCount: number;
  createdAt: string;
  phasesCompletedCount: number;
  phasesCount: number;
}