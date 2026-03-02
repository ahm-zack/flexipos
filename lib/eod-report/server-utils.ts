/**
 * EOD Report server-side utilities
 *
 * Provides utilities for generating sequential EOD report numbers
 * in the format EOD-0001, EOD-0002, etc. (Supabase-native – no Drizzle)
 */

import { createAdminClient } from '@/utils/supabase/admin';

/**
 * Generates the next EOD report number in format EOD-0001
 * Uses database sequence function if available, falls back to application-level generation.
 */
export const generateEODReportNumber = async (): Promise<string> => {
  try {
    const adminClient = createAdminClient();
    const { data, error } = await adminClient.rpc('generate_eod_report_number');
    if (!error && data && String(data).match(/^EOD-\d{4}$/)) {
      return String(data);
    }
  } catch (error) {
    console.warn('Database sequence function not available for EOD reports, using fallback:', error);
  }
  return generateEODReportNumberFallback();
};

/**
 * Fallback for when the database sequence function is unavailable.
 */
const generateEODReportNumberFallback = async (): Promise<string> => {
  try {
    const adminClient = createAdminClient();
    const { data } = await adminClient
      .from('eod_reports')
      .select('report_number')
      .not('report_number', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1);

    let nextNumber = 1;
    if (data && data.length > 0 && data[0].report_number) {
      const match = String(data[0].report_number).match(/^EOD-(\d{4})$/);
      if (match) nextNumber = parseInt(match[1], 10) + 1;
    }
    return `EOD-${nextNumber.toString().padStart(4, '0')}`;
  } catch (error) {
    console.error('Error in EOD report number fallback generation:', error);
    const timestamp = Date.now().toString().slice(-4);
    return `EOD-${timestamp}`;
  }
};

/**
 * Gets the next EOD report number without incrementing the sequence.
 * Useful for previewing the next report number before generating it.
 */
export const getNextEODReportNumber = async (): Promise<string> => {
  try {
    const adminClient = createAdminClient();
    const { data, error } = await adminClient.rpc('get_next_eod_report_number');
    if (!error && data && String(data).match(/^EOD-\d{4}$/)) {
      return String(data);
    }
  } catch (error) {
    console.warn('Database function not available for EOD report preview, using fallback:', error);
  }
  return getNextEODReportNumberFallback();
};

const getNextEODReportNumberFallback = async (): Promise<string> => {
  try {
    const adminClient = createAdminClient();
    const { data } = await adminClient
      .from('eod_reports')
      .select('report_number')
      .not('report_number', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1);

    let nextNumber = 1;
    if (data && data.length > 0 && data[0].report_number) {
      const match = String(data[0].report_number).match(/^EOD-(\d{4})$/);
      if (match) nextNumber = parseInt(match[1], 10) + 1;
    }
    return `EOD-${nextNumber.toString().padStart(4, '0')}`;
  } catch (error) {
    console.error('Error in EOD report number fallback preview:', error);
    const timestamp = Date.now().toString().slice(-4);
    return `EOD-${timestamp}`;
  }
};

/** Validates EOD report number format */
export const validateEODReportNumber = (reportNumber: string): boolean => {
  return /^EOD-\d{4}$/.test(reportNumber);
};

/** Extracts the numeric part from an EOD report number */
export const extractEODReportNumber = (reportNumber: string): number | null => {
  const match = reportNumber.match(/^EOD-(\d{4})$/);
  return match ? parseInt(match[1], 10) : null;
};
