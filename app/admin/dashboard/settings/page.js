"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Banknote,
  Calculator,
  Check,
  CircleDollarSign,
  LoaderCircle,
  Percent,
  RefreshCw,
  Save,
  Truck,
} from "lucide-react";

import { useApi } from "@/hook/useApi";
import { alert } from "@/lib/alert";

const INITIAL_SETTINGS = {
  isDeliveryFee: false,
  deliveryFee: "",
  isVat: false,
  VatAmount: "",
  isTax: false,
  taxAmount: "",
  isServiceCharge: false,
  serviceChargeAmount: "",
};

const CHARGES = [
  {
    key: "delivery",
    title: "Delivery Fee",
    description: "Delivery charge applied to an order.",
    enabledField: "isDeliveryFee",
    amountField: "deliveryFee",
    icon: Truck,
  },
  {
    key: "vat",
    title: "VAT",
    description: "Value-added tax applied to an order.",
    enabledField: "isVat",
    amountField: "VatAmount",
    icon: Percent,
  },
  {
    key: "tax",
    title: "Tax",
    description: "Additional tax applied to an order.",
    enabledField: "isTax",
    amountField: "taxAmount",
    icon: Calculator,
  },
  {
    key: "service",
    title: "Service Charge",
    description: "Service charge applied to an order.",
    enabledField: "isServiceCharge",
    amountField: "serviceChargeAmount",
    icon: CircleDollarSign,
  },
];

function normalizeSettings(data) {
  return {
    isDeliveryFee: Boolean(data.isDeliveryFee),
    deliveryFee: data.deliveryFee ?? "",
    isVat: Boolean(data.isVat),
    VatAmount: data.VatAmount ?? "",
    isTax: Boolean(data.isTax),
    taxAmount: data.taxAmount ?? "",
    isServiceCharge: Boolean(data.isServiceCharge),
    serviceChargeAmount: data.serviceChargeAmount ?? "",
  };
}

function ChargeCard({ charge, settings, onChange }) {
  const Icon = charge.icon;
  const enabled = settings[charge.enabledField];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-amber-300 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
            <Icon className="h-5 w-5 text-amber-400" />
          </div>

          <div>
            <h2 className="font-semibold text-slate-800">
              {charge.title}
            </h2>
            <p className="mt-1 text-sm leading-5 text-slate-500">
              {charge.description}
            </p>
          </div>
        </div>

        <label className="flex shrink-0 cursor-pointer items-center gap-2">
          <span
            className={`text-xs font-semibold ${
              enabled ? "text-emerald-400" : "text-slate-500"
            }`}
          >
            {enabled ? "Enabled" : "Disabled"}
          </span>

          <input
            type="checkbox"
            className="toggle toggle-success"
            checked={enabled}
            onChange={(event) =>
              onChange(charge.enabledField, event.target.checked)
            }
            aria-label={`Enable ${charge.title}`}
          />
        </label>
      </div>

      <div className="mt-6">
        <label
          htmlFor={charge.amountField}
          className="mb-2 block text-sm font-medium text-slate-300"
        >
          Amount
        </label>

        <div className="relative">
          <Banknote className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

          <input
            id={charge.amountField}
            type="number"
            min="0"
            step="1"
            inputMode="numeric"
            placeholder="Enter amount"
            value={settings[charge.amountField]}
            onChange={(event) =>
              onChange(charge.amountField, event.target.value)
            }
            disabled={!enabled}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-600 focus:border-amber-500 disabled:cursor-not-allowed disabled:opacity-40"
          />
        </div>

        <p className="mt-2 text-xs text-slate-500">
          {enabled
            ? "Enter a non-negative whole-number amount."
            : "Enable this charge to edit its amount."}
        </p>
      </div>
    </section>
  );
}

export default function AdminSettingsPage() {
  const { request, isLoading } = useApi();

  const [settings, setSettings] = useState(INITIAL_SETTINGS);
  const [initialSettings, setInitialSettings] =
    useState(INITIAL_SETTINGS);
  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const hasChanges =
    JSON.stringify(settings) !== JSON.stringify(initialSettings);

  const loadSettings = useCallback(async () => {
    setIsFetching(true);

    try {
      const response = await request({
        method: "GET",
        url: "/settings",
      });

      const normalized = normalizeSettings(
        response.data ?? response,
      );

      setSettings(normalized);
      setInitialSettings(normalized);
    } catch (error) {
      alert.error(
        "Unable to load settings",
        error.response?.data?.error ||
          "Please check your connection and try again.",
      );
    } finally {
      setIsFetching(false);
    }
  }, [request]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleChange = (field, value) => {
    setSettings((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const validateForm = () => {
    for (const charge of CHARGES) {
      const enabled = settings[charge.enabledField];
      const value = settings[charge.amountField];

      if (!enabled) continue;

      if (value === "" || value === null || value === undefined) {
        alert.error(
          `${charge.title} amount required`,
          `Enter an amount before enabling ${charge.title.toLowerCase()}.`,
        );
        return false;
      }

      const amount = Number(value);

      if (!Number.isSafeInteger(amount) || amount < 0) {
        alert.error(
          "Invalid amount",
          `${charge.title} must be a non-negative whole number.`,
        );
        return false;
      }
    }

    return true;
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    const confirmed = await alert.confirm({
      title: "Save settings?",
      text: "These changes may affect how charges are calculated at checkout.",
      confirmText: "Save Changes",
      cancelText: "Cancel",
    });

    if (!confirmed.isConfirmed) return;

    const payload = {
      isDeliveryFee: settings.isDeliveryFee,
      deliveryFee:
        settings.deliveryFee === ""
          ? null
          : Number(settings.deliveryFee),

      isVat: settings.isVat,
      VatAmount:
        settings.VatAmount === ""
          ? null
          : Number(settings.VatAmount),

      isTax: settings.isTax,
      taxAmount:
        settings.taxAmount === ""
          ? null
          : Number(settings.taxAmount),

      isServiceCharge: settings.isServiceCharge,
      serviceChargeAmount:
        settings.serviceChargeAmount === ""
          ? null
          : Number(settings.serviceChargeAmount),
    };

    setIsSaving(true);

    try {
      const response = await request({
        method: "PUT",
        url: "/settings/admin",
        data: payload,
      });

      const normalized = normalizeSettings(
        response.data ?? response,
      );

      setSettings(normalized);
      setInitialSettings(normalized);

      alert.success(
        "Settings saved",
        "Your charge settings have been updated successfully.",
      );
    } catch (error) {
      alert.error(
        "Save failed",
        error.response?.data?.error ||
          "Unable to save settings. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <LoaderCircle className="h-5 w-5 animate-spin text-amber-400" />
          <span>Loading settings...</span>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-800 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
              <Calculator className="h-4 w-4" />
              Store Configuration
            </div>

            <h1 className="text-3xl font-bold tracking-tight">
              Charge Settings
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Manage delivery fees, VAT, tax, and service charges
              applied to customer orders.
            </p>
          </div>

          <button
            type="button"
            onClick={loadSettings}
            disabled={isLoading || isSaving}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:border-amber-300 hover:text-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {/* Summary */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {CHARGES.map((charge) => {
            const enabled = settings[charge.enabledField];

            return (
              <div
                key={charge.key}
                className="rounded-xl border border-slate-200 bg-white p-4"
              >
                <p className="truncate text-xs text-slate-500">
                  {charge.title}
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      enabled ? "bg-emerald-400" : "bg-slate-600"
                    }`}
                  />
                  <span
                    className={`text-sm font-semibold ${
                      enabled
                        ? "text-emerald-400"
                        : "text-slate-500"
                    }`}
                  >
                    {enabled ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Settings form */}
        <form onSubmit={handleSave}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {CHARGES.map((charge) => (
              <ChargeCard
                key={charge.key}
                charge={charge}
                settings={settings}
                onChange={handleChange}
              />
            ))}
          </div>

          {/* Save bar */}
          <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div>
              <p className="text-sm font-semibold text-slate-200">
                {hasChanges ? "Unsaved changes" : "All changes saved"}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {hasChanges
                  ? "Save your changes to apply them."
                  : "Your current form matches the saved settings."}
              </p>
            </div>

            <button
              type="submit"
              disabled={!hasChanges || isSaving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isSaving ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : hasChanges ? (
                <Save className="h-4 w-4" />
              ) : (
                <Check className="h-4 w-4" />
              )}

              {isSaving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}