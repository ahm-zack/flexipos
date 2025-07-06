/**
 * EOD Repoexport const generateEODReportNumber = async (): Promise<string> => {
  try {
    // Try to use database sequence function first
    const result = await db.execute(sql`SELECT generate_eod_report_number() as report_number`);
    
    if (result.length > 0) {
      const reportNumber = (result[0] as Record<string, unknown>).report_number as string;
      
      // Validate the format
      if (reportNumber && reportNumber.match(/^EOD-\d{4}$/)) {
        return reportNumber;
      }
    }
  } catch (error) {
    console.warn('Database sequence function not available for EOD reports, using fallback:', error);
  }

  // Fallback: application-level generation
  return generateEODReportNumberFallback();
}; Utilities
 * 
 * This module provides utilities for generating sequential EOD report numbers
 * in the format EOD-0001, EOD-0002, etc.
 */

import { db } from '../db';
import { eodReports } from '../db/schema';
import { sql, desc } from 'drizzle-orm';

/**
 * Generates the next EOD report number in format EOD-0001
 * Uses database sequence function if available, fallback to application-level generation
 */
export const generateEODReportNumber = async (): Promise<string> => {
  try {
    // Try to use database sequence function first
    const result = await db.execute(sql`SELECT generate_eod_report_number() as report_number`);
    
    if (result.length > 0) {
      const reportNumber = (result[0] as Record<string, unknown>).report_number as string;
      
      // Validate the format
      if (reportNumber && reportNumber.match(/^EOD-\d{4}$/)) {
        return reportNumber;
      }
    }
  } catch (error) {
    console.warn('Database sequence function not available for EOD reports, using fallback:', error);
  }

  // Fallback: application-level generation
  return generateEODReportNumberFallback();
};

/**
 * Fallback method for generating EOD report numbers
 * This method handles cases where the database sequence function is not available
 */
const generateEODReportNumberFallback = async (): Promise<string> => {
  try {
    // Get the latest EOD report number
    const latestReport = await db
      .select({ reportNumber: eodReports.reportNumber })
      .from(eodReports)
      .where(sql`${eodReports.reportNumber} IS NOT NULL`)
      .orderBy(desc(eodReports.createdAt))
      .limit(1);

    let nextNumber = 1;

    if (latestReport.length > 0 && latestReport[0].reportNumber) {
      // Extract number from EOD-0001 format
      const match = latestReport[0].reportNumber.match(/^EOD-(\d{4})$/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }

    // Format as EOD-0001
    return `EOD-${nextNumber.toString().padStart(4, '0')}`;
  } catch (error) {
    console.error('Error in EOD report number fallback generation:', error);
    
    // Ultimate fallback: use timestamp-based approach
    const timestamp = Date.now().toString().slice(-4);
    return `EOD-${timestamp}`;
  }
};

/**
 * Gets the next EOD report number without incrementing the sequence
 * Useful for previewing the next report number
 */
export const getNextEODReportNumber = async (): Promise<string> => {
  try {
    // Try to use database function first
    const result = await db.execute(sql`SELECT get_next_eod_report_number() as report_number`);
    
    if (result.length > 0) {
      const reportNumber = (result[0] as Record<string, unknown>).report_number as string;
      
      // Validate the format
      if (reportNumber && reportNumber.match(/^EOD-\d{4}$/)) {
        return reportNumber;
      }
    }
  } catch (error) {
    console.warn('Database function not available for EOD report preview, using fallback:', error);
  }

  // Fallback: calculate next number without incrementing
  return getNextEODReportNumberFallback();
};

/**
 * Fallback method for getting next EOD report number without incrementing
 */
const getNextEODReportNumberFallback = async (): Promise<string> => {
  try {
    // Get the latest EOD report number
    const latestReport = await db
      .select({ reportNumber: eodReports.reportNumber })
      .from(eodReports)
      .where(sql`${eodReports.reportNumber} IS NOT NULL`)
      .orderBy(desc(eodReports.createdAt))
      .limit(1);

    let nextNumber = 1;

    if (latestReport.length > 0 && latestReport[0].reportNumber) {
      // Extract number from EOD-0001 format
      const match = latestReport[0].reportNumber.match(/^EOD-(\d{4})$/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }

    // Format as EOD-0001
    return `EOD-${nextNumber.toString().padStart(4, '0')}`;
  } catch (error) {
    console.error('Error in EOD report number fallback preview:', error);
    
    // Ultimate fallback: use timestamp-based approach
    const timestamp = Date.now().toString().slice(-4);
    return `EOD-${timestamp}`;
  }
};

/**
 * Validates EOD report number format
 */
export const validateEODReportNumber = (reportNumber: string): boolean => {
  return /^EOD-\d{4}$/.test(reportNumber);
};

/**
 * Extracts the numeric part from an EOD report number
 */
export const extractEODReportNumber = (reportNumber: string): number | null => {
  const match = reportNumber.match(/^EOD-(\d{4})$/);
  return match ? parseInt(match[1], 10) : null;
};
