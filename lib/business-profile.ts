import type { Json } from "@/database.types";
import {
  RESTAURANT_CONFIG,
  type RestaurantConfig,
} from "@/lib/restaurant-config";

type JsonObject = Record<string, Json | undefined>;

export interface RawBusinessProfile {
  id?: string | null;
  name?: string | null;
  name_ar?: string | null;
  address?: string | null;
  address_ar?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  logo_url?: string | null;
  timezone?: string | null;
  currency?: string | null;
  vat_number?: string | null;
  cr_number?: string | null;
  settings?: Json | null;
}

export interface BusinessProfile {
  id: string;
  name: string;
  nameAr: string | null;
  address: string | null;
  addressAr: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  logoUrl: string | null;
  timezone: string | null;
  currency: string | null;
  vatNumber: string | null;
  crNumber: string | null;
  settings: JsonObject;
}

function isJsonObject(value: Json | null | undefined): value is JsonObject {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function pickString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value !== "string") {
      continue;
    }

    const trimmed = value.trim();
    if (trimmed.length > 0) {
      return trimmed;
    }
  }

  return null;
}

function readSettingString(settings: JsonObject, ...keys: string[]) {
  return pickString(...keys.map((key) => settings[key]));
}

export function getBusinessDisplayName(name?: string | null): string {
  return pickString(name) || "FlexiPOS";
}

export function isValidVatNumber(value?: string | null): boolean {
  return typeof value === "string" && /^\d{15}$/.test(value.trim());
}

export function normalizeBusinessProfile(
  business?: RawBusinessProfile | null,
): BusinessProfile | null {
  if (!business || !business.id) {
    return null;
  }

  const settings = isJsonObject(business.settings) ? business.settings : {};

  return {
    id: business.id,
    name: getBusinessDisplayName(business.name),
    nameAr: pickString(
      business.name_ar,
      readSettingString(settings, "nameAr", "name_ar"),
    ),
    address: pickString(business.address),
    addressAr: pickString(
      business.address_ar,
      readSettingString(settings, "addressAr", "address_ar"),
    ),
    phone: pickString(business.phone),
    email: pickString(business.email),
    website: pickString(business.website),
    logoUrl: pickString(business.logo_url),
    timezone: pickString(business.timezone),
    currency: pickString(business.currency),
    vatNumber: pickString(
      business.vat_number,
      readSettingString(settings, "vatNumber", "vat_number"),
    ),
    crNumber: pickString(
      business.cr_number,
      readSettingString(settings, "crNumber", "cr_number"),
    ),
    settings,
  };
}

export function toRestaurantConfig(
  business?: BusinessProfile | null,
): Partial<RestaurantConfig> {
  if (!business) {
    return {
      ...RESTAURANT_CONFIG,
    };
  }

  return {
    ...RESTAURANT_CONFIG,
    name: business.name,
    nameAr: business.nameAr || "",
    address: business.address || "",
    addressAr: business.addressAr || "",
    phone: business.phone || "",
    email: business.email || "",
    website: business.website || "",
    vatNumber: business.vatNumber || "",
    crNumber: business.crNumber || "",
    logo: business.logoUrl || RESTAURANT_CONFIG.logo,
  };
}

export function canGenerateZatcaQr(config: Partial<RestaurantConfig>): boolean {
  const sellerName = pickString(config.nameAr, config.name);

  return Boolean(
    (config.zatcaCompliant ?? true) && sellerName && isValidVatNumber(config.vatNumber),
  );
}

export function getZatcaSellerName(config: Partial<RestaurantConfig>): string {
  return pickString(config.nameAr, config.name) || getBusinessDisplayName(config.name);
}